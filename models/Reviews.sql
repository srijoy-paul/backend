CREATE TABLE reviews(
review_id BIGSERIAL PRIMARY KEY,
restaurant_id INT NOT NULL,
user_id INT NOT NULL,
rating INT CHECK (rating>=1 AND rating<=5),
comment TEXT,
created_at VARCHAR(200),
CONSTRAINT fk_restaurantModel
    FOREIGN KEY(restaurant_id)
        REFERENCES restaurant(restaurantid),
CONSTRAINT fk_userModel
    FOREIGN KEY(user_id)
        REFERENCES userinfo(id)
);
