CREATE TABLE userInfo(
    id BIGSERIAL NOT NULL,
    auth0Id TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(200),
    addressLine1 TEXT,
    city VARCHAR(150),
    country VARCHAR(150)
);