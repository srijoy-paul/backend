CREATE TABLE restaurant(
    userid INT, 
    restaurantname VARCHAR(150) NOT NULL,
    city VARCHAR(150) NOT NULL,
    country VARCHAR(100) NOT NULL,
    deliveryprice INT NOT NULL,
    estimateddeliverytime TIME NOT NULL,
    cuisines TEXT [] NOT NULL,
    menuitems JSONB[],
    imageurl VARCHAR(255) NOT NULL,
    lastupdated DATE NOT NULL, 
    CONSTRAINT fk_userModel 
        FOREIGN KEY(userid) 
            REFERENCES userinfo(id)
);

-- CREATE TABLE menuitem(
--     id INT NOT NULL,
--     name VARCHAR(150) NOT NULL, 
--     price INT NOT NULL
-- );