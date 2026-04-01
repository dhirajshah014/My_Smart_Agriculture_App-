async function loadMarketItems() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    try {
        const res = await fetch('/api/market/products');
        const products = await res.json();
        
        grid.innerHTML = products.map(p => `
            <div class="bg-white p-6 rounded-3xl border border-primary/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div class="w-full h-48 bg-surface-variant rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative">
                    <span class="material-symbols-outlined text-primary/20 text-6xl group-hover:scale-110 transition-transform">potted_plant</span>
                    <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-primary shadow-sm">Verified Farm</div>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between items-start">
                        <h3 class="font-headline font-extrabold text-primary tracking-tight">${p.name}</h3>
                        <span class="text-tertiary font-black">$${p.price.toFixed(2)}/kg</span>
                    </div>
                    <p class="text-secondary text-xs line-clamp-2 leading-relaxed">${p.description}</p>
                    <div class="pt-4 flex items-center justify-between">
                        <span class="text-[10px] font-bold text-primary/40 uppercase tracking-widest">${p.quantity}kg available</span>
                        <button onclick="addToCart(${p.product_id}, '${p.name}', ${p.price})" class="p-3 bg-primary text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg">
                            <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('') || '<div class="col-span-full text-center py-20 opacity-40">No products available yet.</div>';
    } catch (e) {
        console.error('Failed to load products', e);
    }
}

async function loadFarmerDashboard() {
    const content = document.getElementById('farmerContent');
    if (!content) return;

    try {
        const res = await fetch('/api/market/me/products');
        const products = await res.json();

        if (res.status === 403) {
            content.innerHTML = `<div class="text-center space-y-4">
                <p class="text-secondary font-bold">Only Farmers can list produce.</p>
                <p class="text-xs">Please update your role in settings if you wish to sell.</p>
            </div>`;
            return;
        }

        const table = `
            <table class="w-full text-left text-sm">
                <thead class="bg-surface-container-low text-primary uppercase text-[10px] font-black">
                    <tr>
                        <th class="p-6">Product</th>
                        <th class="p-6">Price</th>
                        <th class="p-6">Stock</th>
                        <th class="p-6">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-primary/5">
                    ${products.map(p => `
                        <tr class="hover:bg-primary/5 transition-colors">
                            <td class="p-6 font-bold text-primary">${p.name}</td>
                            <td class="p-6">$${p.price}/kg</td>
                            <td class="p-6">${p.quantity}kg</td>
                            <td class="p-6"><span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase">Active</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        content.innerHTML = products.length ? table : '<p class="font-bold opacity-40">No active listings.</p>';
        
        // Load stats
        const stats = document.getElementById('farmerStats');
        if (stats) {
            stats.innerHTML = `
                <div class="bg-primary p-6 rounded-3xl text-white">
                    <p class="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Listings</p>
                    <p class="text-3xl font-headline font-black">${products.length}</p>
                </div>
                <div class="bg-white p-6 rounded-3xl border border-primary/5">
                    <p class="text-[10px] font-bold uppercase tracking-widest text-secondary">Active Stock</p>
                    <p class="text-3xl font-headline font-black text-primary">${products.reduce((acc, p) => acc + p.quantity, 0)}kg</p>
                </div>
            `;
        }

    } catch (e) {
        console.error('Farmer load error', e);
    }
}

function addToCart(id, name, price) {
    let cart = JSON.parse(localStorage.getItem('agri_cart') || '[]');
    cart.push({ id, name, price });
    localStorage.setItem('agri_cart', JSON.stringify(cart));
    updateCartCount();
    // Subtle animation
    const count = document.getElementById('cartCount');
    count.classList.add('scale-150');
    setTimeout(() => count.classList.remove('scale-150'), 300);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('agri_cart') || '[]');
    const counter = document.getElementById('cartCount');
    if (counter) counter.innerText = cart.length;
}

function toggleModal(id) {
    const modal = document.getElementById(id);
    modal.classList.toggle('hidden');
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (document.getElementById('productGrid')) loadMarketItems();
    
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('p_name').value,
                price: parseFloat(document.getElementById('p_price').value),
                quantity: parseInt(document.getElementById('p_qty').value),
                description: document.getElementById('p_desc').value
            };
            const res = await fetch('/api/market/products', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            if (res.ok) {
                toggleModal('addProductModal');
                loadFarmerDashboard();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to list product');
            }
        });
    }
});
