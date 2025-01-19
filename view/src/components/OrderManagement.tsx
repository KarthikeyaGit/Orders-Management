import React, { useState, useEffect } from "react";

interface Order {
    id: number;
    order_description: string;
    product_count: number;
    created_at: string;
    product_ids: number[];
}

interface Product {
    id: number;
    product_name: string;
    product_description: string;
}

const OrderManagement: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false); 
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [orderDescription, setOrderDescription] = useState<string>(""); 
    const [editingOrder, setEditingOrder] = useState<Order | null>(null); 
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null); // Track order to be deleted
    const [loading, setLoading] = useState<boolean>(false);

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchOrders();
        fetchProducts();

    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/orders`);
            if (!response.ok) {
                throw new Error("Failed to fetch orders");
            }
            const data: Order[] = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/products`);
            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }
            const data: Product[] = await response.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };


    const handleProductChange = (productId: number) => {
        setSelectedProducts((prevSelectedProducts) =>
            prevSelectedProducts.includes(productId)
                ? prevSelectedProducts.filter((id) => id !== productId)
                : [...prevSelectedProducts, productId]
        );
    };

    const handleOrderDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOrderDescription(e.target.value);
    };

    const saveOrder = async () => {
        setLoading(true);

        const orderData = {
            orderDescription,
            products: selectedProducts,
        };

        try {
            const response = await fetch(`${apiUrl}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                throw new Error("Failed to create order");
            }
            setLoading(false);

            toggleModal();
            fetchOrders();
        } catch (error) {
            setLoading(false);

            console.error("Error creating order:", error);
        }
    };

    const updateOrder = async () => {

        if (editingOrder === null) return;
        setLoading(true);

        const orderData = {
            orderDescription,
            products: selectedProducts,
        };

        try {
            const response = await fetch(`${apiUrl}/api/orders/${editingOrder.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                throw new Error("Failed to update order");
            }

            setLoading(false);


            toggleModal();
            fetchOrders();
        } catch (error) {
            setLoading(false);

            console.error("Error updating order:", error);
        }
    };

    const deleteOrder = async () => {

        if (!orderToDelete) return;
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/orders/${orderToDelete.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete order");
            }
            setLoading(false);


            setIsDeleteModalOpen(false);
            fetchOrders();
        } catch (error) {
            setLoading(false);

            console.error("Error deleting order:", error);
        }
    };

    const filteredOrders = orders.filter(
        (order) =>
            order.id.toString().includes(search) ||
            order.order_description.toLowerCase().includes(search.toLowerCase())
    );

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        if (isModalOpen) {
            setEditingOrder(null); 
            setOrderDescription(""); 
            setSelectedProducts([]); 
        }
    };

    const isSaveDisabled = !orderDescription || selectedProducts && selectedProducts.length === 0;

    const openEditModal = (selected: Order) => {
        setOrderDescription(selected.order_description);
        setEditingOrder(selected);
        toggleModal();
        setSelectedProducts(selected.product_ids);
    };

    const openDeleteModal = (order: Order) => {
        setOrderToDelete(order);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="container mt-4">
            <div className="card p-4">
                <h1>Order Managements</h1>
                <input
                    type="text"
                    placeholder="Search by order ID or description"
                    className="form-control my-3"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Order Description</th>
                            <th>Count of Products</th>
                            <th>Created Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.order_description}</td>
                                <td>{order.product_count || "0"}</td>
                                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn btn-primary btn-sm me-2" onClick={() => openEditModal(order)}>
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => openDeleteModal(order)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button onClick={toggleModal} className="btn btn-success">
                    New Order
                </button>
            </div>

            {/* Edit/Create Order Modal */}
            {isModalOpen && (
                <div className="modal fade show" tabIndex={-1} style={{ display: "block" }} aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingOrder ? "Edit Order" : "Create New Order"}</h5>
                                <button type="button" className="btn-close" onClick={toggleModal}></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label htmlFor="orderDescription" className="form-label">
                                            Order Description
                                        </label>
                                        <input
                                            type="text"
                                            id="orderDescription"
                                            className="form-control"
                                            value={orderDescription}
                                            onChange={handleOrderDescriptionChange}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Select Products</label>
                                        <div style={{ maxHeight: "200px", overflowY: "scroll" }}>
                                            {products.map((product) => (
                                                <div key={product.id} className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id={`product-${product.id}`}
                                                        checked={selectedProducts && selectedProducts.includes(product.id)}
                                                        onChange={() => handleProductChange(product.id)}
                                                    />
                                                    <label className="form-check-label" htmlFor={`product-${product.id}`}>
                                                        <strong>{product.product_name}</strong><br />
                                                        <small>{product.product_description}</small>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={toggleModal}>
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={editingOrder ? updateOrder : saveOrder}
                                    disabled={isSaveDisabled}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        editingOrder ? "Update Order" : "Save Order"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="modal fade show" tabIndex={-1} style={{ display: "block" }} aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Deletion</h5>
                                <button type="button" className="btn-close" onClick={() => setIsDeleteModalOpen(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this order?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-danger" onClick={deleteOrder}>
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        "Delete"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
