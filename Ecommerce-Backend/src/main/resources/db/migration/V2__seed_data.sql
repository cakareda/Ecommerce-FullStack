INSERT INTO categories (name, description) VALUES
    ('Electronics', 'Phones, laptops, and accessories'),
    ('Books', 'Fiction and non-fiction books'),
    ('Clothing', 'Apparel and accessories'),
    ('Home & Kitchen', 'Household and kitchen goods');

INSERT INTO products (name, description, brand, price, category, release_date, product_available, stock_quantity)
VALUES
    ('Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 'LogiTech', 19.99, 'Electronics', CURRENT_DATE, TRUE, 100),
    ('Mechanical Keyboard', 'RGB backlit mechanical keyboard', 'KeyCraft', 59.99, 'Electronics', CURRENT_DATE, TRUE, 50),
    ('Clean Code', 'A Handbook of Agile Software Craftsmanship', 'Prentice Hall', 34.99, 'Books', CURRENT_DATE, TRUE, 30),
    ('Cotton T-Shirt', 'Plain crew neck cotton t-shirt', 'BasicWear', 12.99, 'Clothing', CURRENT_DATE, TRUE, 200);
