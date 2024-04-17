CREATE TABLE restaurant(
    userid INT, 
    restaurantid BIGSERIAL PRIMARY KEY,
    restaurantname VARCHAR(150) NOT NULL,
    city VARCHAR(150) NOT NULL,
    country VARCHAR(100) NOT NULL,
    deliveryprice INT NOT NULL,
    estimateddeliverytime TIME NOT NULL,
    cuisines TEXT [] NOT NULL,
    -- menuitems uuid[],
    menuitems jsonb[],
    imageurl VARCHAR(255) NOT NULL,
    lastupdated VARCHAR(200) NOT NULL, 
    CONSTRAINT fk_userModel 
        FOREIGN KEY(userid) 
            REFERENCES userinfo(id)
    -- CONSTRAINT fk_menuitem_model
    --     FOREIGN KEY(menuitems)
    --         REFERENCES menuitem(mitem_id)
);

-- CREATE TABLE menuitem(
--     mitem_id uuid DEFAULT gen_random_uuid(),
--     name VARCHAR(150) NOT NULL, 
--     price INT NOT NULL
-- );