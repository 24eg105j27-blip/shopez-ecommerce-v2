import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function getSupabaseClient(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return {
    client: createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    }),
    admin: createClient(supabaseUrl, serviceKey),
    token,
  };
}

async function getUserId(req: Request): Promise<string | null> {
  const { client } = getSupabaseClient(req);
  const { data: { user } } = await client.auth.getUser();
  return user?.id ?? null;
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Helper: return full populated cart for a user
async function getPopulatedCart(admin: any, userId: string) {
  const { data, error } = await admin
    .from("cart_items")
    .select("id, quantity, product_id, products!cart_items_product_id_fkey(id, product_name, price, discount_price, images, stock, brand)")
    .eq("user_id", userId);

  if (error) return [];
  return (data || []).map((item: any) => ({
    id: item.id,
    productId: item.product_id,
    quantity: item.quantity,
    product: {
      id: item.products.id,
      productName: item.products.product_name,
      price: Number(item.products.price),
      discountPrice: item.products.discount_price ? Number(item.products.discount_price) : null,
      images: item.products.images || [],
      stock: item.products.stock,
      brand: item.products.brand,
    },
    subtotal: item.quantity * (item.products.discount_price ? Number(item.products.discount_price) : Number(item.products.price)),
  }));
}

async function handleProducts(req: Request, pathParts: string[], method: string) {
  const { admin } = getSupabaseClient(req);

  // GET single product by ID
  if (method === "GET" && pathParts.length === 2) {
    const { data, error } = await admin.from("products").select("*, category:categories(id, category_name, category_image)").eq("id", pathParts[1]).single();
    if (error) return errorResponse("Product not found", 404);
    return jsonResponse(data);
  }

  // GET all products (with filters)
  if (method === "GET") {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category") || "";
    const featured = url.searchParams.get("featured");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");
    const sort = url.searchParams.get("sort") || "created_at";

    let query = admin.from("products").select("*, category:categories(id, category_name, category_image)", { count: "exact" });
    if (search) query = query.ilike("product_name", `%${search}%`);
    if (category) query = query.eq("category_id", category);
    if (featured === "true") query = query.eq("featured", true);

    if (sort === "price_asc") query = query.order("price", { ascending: true });
    else if (sort === "price_desc") query = query.order("price", { ascending: false });
    else if (sort === "rating") query = query.order("rating", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, count, error } = await query;
    if (error) return errorResponse(error.message);
    return jsonResponse({ products: data, total: count, page, limit });
  }

  // Admin: Create product
  if (method === "POST") {
    const body = await req.json();
    const { data, error } = await admin.from("products").insert(body).select("*, category:categories(id, category_name, category_image)").single();
    if (error) return errorResponse(error.message);
    return jsonResponse(data, 201);
  }

  // Admin: Update product
  if (method === "PUT" && pathParts.length === 2) {
    const body = await req.json();
    const { data, error } = await admin.from("products").update(body).eq("id", pathParts[1]).select("*, category:categories(id, category_name, category_image)").single();
    if (error) return errorResponse(error.message);
    return jsonResponse(data);
  }

  // Admin: Delete product
  if (method === "DELETE" && pathParts.length === 2) {
    const { error } = await admin.from("products").delete().eq("id", pathParts[1]);
    if (error) return errorResponse(error.message);
    return jsonResponse({ success: true });
  }

  return errorResponse("Not found", 404);
}

// ==================== CART HANDLER ====================
// CRITICAL: Every mutation returns full populated cart array
async function handleCart(req: Request, method: string, pathParts: string[]) {
  const userId = await getUserId(req);
  if (!userId) return errorResponse("Unauthorized", 401);
  const { admin } = getSupabaseClient(req);

  // GET cart - return full populated cart
  if (method === "GET") {
    const items = await getPopulatedCart(admin, userId);
    console.log("Cart API response:", items.length, "items");
    return jsonResponse({ items });
  }

  // POST - add to cart (upsert), then return full populated cart
  if (method === "POST") {
    const body = await req.json();
    const { productId, quantity = 1 } = body;

    // Check if item already exists
    const { data: existing } = await admin
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      const newQty = existing.quantity + quantity;
      const { error } = await admin.from("cart_items").update({ quantity: newQty }).eq("id", existing.id);
      if (error) return errorResponse(error.message);
    } else {
      const { error } = await admin.from("cart_items").insert({ user_id: userId, product_id: productId, quantity });
      if (error) return errorResponse(error.message);
    }

    // Return FULL populated cart after add
    const items = await getPopulatedCart(admin, userId);
    console.log("Cart API response after POST:", items.length, "items");
    return jsonResponse({ items });
  }

  // PUT - update quantity, then return full populated cart
  if (method === "PUT" && pathParts.length === 2) {
    const body = await req.json();
    const { quantity } = body;
    if (!quantity || quantity < 1) return errorResponse("Invalid quantity");

    const { error } = await admin.from("cart_items").update({ quantity }).eq("id", pathParts[1]).eq("user_id", userId);
    if (error) return errorResponse(error.message);

    const items = await getPopulatedCart(admin, userId);
    return jsonResponse({ items });
  }

  // DELETE - remove item, then return full populated cart
  if (method === "DELETE" && pathParts.length === 2) {
    const { error } = await admin.from("cart_items").delete().eq("id", pathParts[1]).eq("user_id", userId);
    if (error) return errorResponse(error.message);

    const items = await getPopulatedCart(admin, userId);
    return jsonResponse({ items });
  }

  return errorResponse("Not found", 404);
}

async function handleOrders(req: Request, method: string, pathParts: string[]) {
  const userId = await getUserId(req);
  if (!userId) return errorResponse("Unauthorized", 401);
  const { admin } = getSupabaseClient(req);

  if (method === "GET" && pathParts.length <= 1) {
    const { data, error } = await admin.from("orders").select("*, order_items(*)").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) return errorResponse(error.message);
    return jsonResponse({ orders: data });
  }

  if (method === "GET" && pathParts.length === 2) {
    const { data, error } = await admin.from("orders").select("*, order_items(*)").eq("id", pathParts[1]).eq("user_id", userId).single();
    if (error) return errorResponse("Order not found", 404);
    return jsonResponse(data);
  }

  if (method === "POST") {
    const body = await req.json();
    const { shippingAddress, paymentMethod = "COD" } = body;

    const { data: cartData } = await admin
      .from("cart_items")
      .select("quantity, product_id, products!cart_items_product_id_fkey(id, product_name, price, discount_price, images, stock)")
      .eq("user_id", userId);

    if (!cartData || cartData.length === 0) return errorResponse("Cart is empty");

    const subtotal = cartData.reduce((sum: number, item: any) => sum + item.quantity * Number(item.products.price), 0);
    const discount = cartData.reduce((sum: number, item: any) => sum + item.quantity * (Number(item.products.price) - (item.products.discount_price ? Number(item.products.discount_price) : Number(item.products.price))), 0);
    const tax = subtotal * 0.18;
    const shipping = subtotal < 500 ? 40 : 0;
    const grandTotal = subtotal - discount + tax + shipping;

    const { data: order, error } = await admin.from("orders").insert({
      user_id: userId, total_amount: subtotal, discount, tax, shipping,
      grand_total: grandTotal, shipping_address: shippingAddress, payment_method: paymentMethod,
    }).select().single();
    if (error) return errorResponse(error.message);

    const orderItems = cartData.map((item: any) => ({
      order_id: order.id, product_id: item.product_id, product_name: item.products.product_name,
      quantity: item.quantity, price: Number(item.products.price),
      discount_price: item.products.discount_price ? Number(item.products.discount_price) : null,
      image: item.products.images?.[0] || null,
    }));
    await admin.from("order_items").insert(orderItems);
    await admin.from("cart_items").delete().eq("user_id", userId);

    return jsonResponse({ order, items: orderItems }, 201);
  }

  return errorResponse("Not found", 404);
}

async function handleCategories(req: Request, method: string, pathParts: string[]) {
  const { admin } = getSupabaseClient(req);

  if (method === "GET") {
    const { data, error } = await admin.from("categories").select("*").order("category_name");
    if (error) return errorResponse(error.message);
    return jsonResponse({ categories: data });
  }
  if (method === "POST") {
    const body = await req.json();
    const { data, error } = await admin.from("categories").insert(body).select().single();
    if (error) return errorResponse(error.message);
    return jsonResponse(data, 201);
  }
  if (method === "PUT" && pathParts.length === 2) {
    const body = await req.json();
    const { data, error } = await admin.from("categories").update(body).eq("id", pathParts[1]).select().single();
    if (error) return errorResponse(error.message);
    return jsonResponse(data);
  }
  if (method === "DELETE" && pathParts.length === 2) {
    const { error } = await admin.from("categories").delete().eq("id", pathParts[1]);
    if (error) return errorResponse(error.message);
    return jsonResponse({ success: true });
  }
  return errorResponse("Not found", 404);
}

async function handleBanners(req: Request, method: string, pathParts: string[]) {
  const { admin } = getSupabaseClient(req);

  if (method === "GET") {
    const { data, error } = await admin.from("banners").select("*").order("created_at", { ascending: false });
    if (error) return errorResponse(error.message);
    return jsonResponse({ banners: data });
  }
  if (method === "POST") {
    const body = await req.json();
    const { data, error } = await admin.from("banners").insert(body).select().single();
    if (error) return errorResponse(error.message);
    return jsonResponse(data, 201);
  }
  if (method === "PUT" && pathParts.length === 2) {
    const body = await req.json();
    const { data, error } = await admin.from("banners").update(body).eq("id", pathParts[1]).select().single();
    if (error) return errorResponse(error.message);
    return jsonResponse(data);
  }
  if (method === "DELETE" && pathParts.length === 2) {
    const { error } = await admin.from("banners").delete().eq("id", pathParts[1]);
    if (error) return errorResponse(error.message);
    return jsonResponse({ success: true });
  }
  return errorResponse("Not found", 404);
}

async function handleWishlist(req: Request, method: string, pathParts: string[]) {
  const userId = await getUserId(req);
  if (!userId) return errorResponse("Unauthorized", 401);
  const { admin } = getSupabaseClient(req);

  if (method === "GET") {
    const { data, error } = await admin
      .from("wishlist_items")
      .select("id, product_id, products!wishlist_items_product_id_fkey(id, product_name, price, discount_price, images, stock, brand, rating)")
      .eq("user_id", userId);
    if (error) return errorResponse(error.message);
    const items = (data || []).map((item: any) => ({
      id: item.id, productId: item.product_id,
      product: { id: item.products.id, productName: item.products.product_name, price: Number(item.products.price), discountPrice: item.products.discount_price ? Number(item.products.discount_price) : null, images: item.products.images, stock: item.products.stock, brand: item.products.brand, rating: Number(item.products.rating) },
    }));
    return jsonResponse({ items });
  }
  if (method === "POST") {
    const body = await req.json();
    const { data, error } = await admin.from("wishlist_items").insert({ user_id: userId, product_id: body.productId }).select().single();
    if (error) { if (error.code === "23505") return errorResponse("Already in wishlist"); return errorResponse(error.message); }
    return jsonResponse(data, 201);
  }
  if (method === "DELETE" && pathParts.length === 2) {
    const { error } = await admin.from("wishlist_items").delete().eq("id", pathParts[1]).eq("user_id", userId);
    if (error) return errorResponse(error.message);
    return jsonResponse({ success: true });
  }
  return errorResponse("Not found", 404);
}

async function handleProfile(req: Request, method: string, pathParts: string[]) {
  const userId = await getUserId(req);
  if (!userId) return errorResponse("Unauthorized", 401);
  const { admin } = getSupabaseClient(req);

  if (method === "GET") {
    const { data, error } = await admin.from("profiles").select("*").eq("id", userId).single();
    if (error) return errorResponse(error.message);
    return jsonResponse(data);
  }
  if (method === "PUT") {
    const body = await req.json();
    const { data, error } = await admin.from("profiles").update(body).eq("id", userId).select().single();
    if (error) return errorResponse(error.message);
    return jsonResponse(data);
  }
  return errorResponse("Not found", 404);
}

async function handleAdmin(req: Request, pathParts: string[], method: string) {
  const userId = await getUserId(req);
  if (!userId) return errorResponse("Unauthorized", 401);
  const { admin } = getSupabaseClient(req);

  const { data: profile } = await admin.from("profiles").select("role").eq("id", userId).single();
  if (!profile || profile.role !== "admin") return errorResponse("Forbidden", 403);

  const subResource = pathParts[1] || "";

  if (subResource === "dashboard") {
    const [products, orders, users, orderItems] = await Promise.all([
      admin.from("products").select("id", { count: "exact" }),
      admin.from("orders").select("id, grand_total, order_status, created_at", { count: "exact" }),
      admin.from("profiles").select("id", { count: "exact" }),
      admin.from("order_items").select("product_name, quantity, price"),
    ]);

    const totalRevenue = (orders.data || []).reduce((s: number, o: any) => s + Number(o.grand_total), 0);
    const productSales: Record<string, number> = {};
    (orderItems.data || []).forEach((item: any) => { productSales[item.product_name] = (productSales[item.product_name] || 0) + item.quantity; });
    const topProducts = Object.entries(productSales).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, qty]) => ({ name, qty }));
    const monthlySales: Record<string, number> = {};
    (orders.data || []).forEach((o: any) => { const m = new Date(o.created_at).toISOString().slice(0, 7); monthlySales[m] = (monthlySales[m] || 0) + Number(o.grand_total); });
    const statusCounts: Record<string, number> = {};
    (orders.data || []).forEach((o: any) => { statusCounts[o.order_status] = (statusCounts[o.order_status] || 0) + 1; });

    return jsonResponse({ totalRevenue, totalProducts: products.count || 0, totalOrders: orders.count || 0, totalUsers: users.count || 0, topProducts, monthlySales, statusCounts });
  }

  if (subResource === "users") {
    const { data, error } = await admin.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) return errorResponse(error.message);
    return jsonResponse({ users: data });
  }

  if (subResource === "orders" && method === "PUT" && pathParts.length === 3) {
    const body = await req.json();
    const { data, error } = await admin.from("orders").update(body).eq("id", pathParts[2]).select().single();
    if (error) return errorResponse(error.message);
    return jsonResponse(data);
  }

  if (subResource === "orders") {
    const { data, error } = await admin.from("orders").select("*, order_items(*), profiles!orders_user_id_fkey(name, email)").order("created_at", { ascending: false });
    if (error) return errorResponse(error.message);
    return jsonResponse({ orders: data });
  }

  return errorResponse("Not found", 404);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const fullPath = url.pathname.replace(/^\/+/, "");
  // Supabase edge functions may include /functions/v1/shop-api in path or just the suffix
  // Strip any known prefix to get just the route part
  let routePath = fullPath;
  const prefixIdx = routePath.indexOf("shop-api/");
  if (prefixIdx !== -1) {
    routePath = routePath.substring(prefixIdx + "shop-api/".length);
  } else if (routePath === "shop-api") {
    routePath = "";
  }
  const pathParts = routePath.split("/").filter(Boolean);
  const method = req.method;

  try {
    const resource = pathParts[0] || "";
    switch (resource) {
      case "products": return await handleProducts(req, pathParts, method);
      case "cart": return await handleCart(req, method, pathParts);
      case "orders": return await handleOrders(req, method, pathParts);
      case "categories": return await handleCategories(req, method, pathParts);
      case "banners": return await handleBanners(req, method, pathParts);
      case "wishlist": return await handleWishlist(req, method, pathParts);
      case "profile": return await handleProfile(req, method, pathParts);
      case "admin": return await handleAdmin(req, pathParts, method);
      default: return errorResponse("Not found", 404);
    }
  } catch (err) {
    console.error("API Error:", err);
    return errorResponse("Internal server error", 500);
  }
});
