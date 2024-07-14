create table orders(
restaurant_id INT NOT NULL,
user_id INT NOT NULL,
email varchar(255),
name varchar(255),
addressline1 varchar(1000),
city varchar(150),
cartitems jsonb[],
totalamount INT,
status order_status,
created_at VARCHAR(200),
CONSTRAINT fk_userModel 
        FOREIGN KEY(user_id) 
            REFERENCES userinfo(id),
CONSTRAINT fk_restaurantModel 
        FOREIGN KEY(restaurant_id) 
            REFERENCES restaurant(restaurantid)
);