-- Users
INSERT INTO `tailornowdb`.`users` (`id`, `username`, `password`, `address1`, `address2`, `city`, `postalcode`, `shopname`, `email`, `phoneno`, `photo`, `usertype`) VALUES ('1', 'chongpang', '$2a$10$BwZoEjTZ0iolYFOt.XN84u5rsq2qWKq6HTk3z.1uh1c3FFITsKreu', '453A Ang Mo Kio Ave 10', '#01-431', 'Singapore', '561453', 'Chong Boon Market Tapering Store', 'chongboon@scrub.com', '91034123', '2df5185e-8842-47a5-bf5f-0fab5cd57ab6.jpeg', 'tailor');
INSERT INTO `tailornowdb`.`users` (`id`, `firstname`, `lastname`, `username`, `password`, `address1`, `address2`, `city`, `postalcode`, `gender`, `email`, `phoneno`, `photo`, `usertype`) VALUES ('6', 'Lee', 'Sian Long', 'customer1', '$2a$10$ErIuSLDcSgG2ARFJy9YxCObn55gdEodeRxwTYOJDkRqNSP/aEf5UK', '587 Ang Mo Kio Ave 3', '#05-513', 'Singapore', '560587', 'male', 'leesianlong@gmail.com', '81234567', 'ad640f68-02f5-4793-a45a-6fca5423ac6b.png', 'customer');
INSERT INTO `tailornowdb`.`users` (`id`, `firstname`, `lastname`, `username`, `password`, `address1`, `address2`, `city`, `postalcode`, `gender`, `email`, `phoneno`, `photo`, `usertype`) VALUES ('2', 'Kai', 'Kai', 'customer2', '$2a$10$DTq.HxYWakT0D/fF1jG97uHssiA0rzecL/iB9xDUUIU6ccxMWII.6', '618 Ang Mo Kio Ave 4', '#07-2923', 'Singapore', '560618', 'male', 'kaikai@gmail.com', '81589736', '2b5cf541-770b-4701-93ff-f291c5d4ef6e.jpeg', 'customer');
INSERT INTO `tailornowdb`.`users` (`id`, `firstname`, `lastname`, `username`, `password`, `address1`, `address2`, `city`, `postalcode`, `gender`, `email`, `phoneno`, `photo`, `usertype`) VALUES ('3', 'admin', 'admin', 'admin', '$2a$10$kVdS0ALlLmQJVrLvyvk9G.1mybRVjeXNIKVI9JeL0GX0pmaEjYEdy', '204 Ang Mo Kio Ave 9', '#01-041', 'Singapore', '569773', 'male', 'admin@tailornow.com', '67234561', 'fa247cd2-4f8e-44e7-b4f3-01be074fd41c.jpeg', 'admin');
INSERT INTO `tailornowdb`.`users` (`id`, `username`, `password`, `address1`, `address2`, `city`, `postalcode`, `shopname`, `email`, `phoneno`, `photo`, `usertype`) VALUES ('4', 'ahtong', '$2a$10$8BEE56TVSRrCxAn.ANVKC.466.sJOqULv8zcgMb0AyKWAoArr.M4O', '713 Ang Mo Kio Ave 6', '#01-562', 'Singapore', '560713', 'Ah Tong Tailor', 'ahtong@gmail.com', '12345678', 'd8064486-d2d6-4b0f-a5d4-5f41876ee987.jpeg', 'tailor');
INSERT INTO `tailornowdb`.`users` (`id`, `firstname`, `lastname`, `username`, `password`, `gender`, `email`, `phoneno`, `transport`, `licenseno`, `photo`, `usertype`) VALUES ('5', 'Ken', 'Chow', 'rider1', '$2a$10$Ddh7oRsiycAZfz/FaVC.3eMM/TZj3H3jpV30kASvGPTwLDmq4jNoC', 'male', 'kenchow@gmail.com', '63456799', 'motocycle', '1001', 'f22bbd3e-ba04-4611-823b-4911fd8346d8.jpeg', 'rider');



-- Products (Catalogue)
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('1', 'Ah Tong Tailor', 'Portable Sewing Kit', '5', 'de9f7110-35c1-4ceb-b291-ff943aa9d128.jpeg', 'It\'s always handy to have a needle and thread around. Especially when you\'re away from home and can\'t rely on your parents to sew your buttons back on! A handy hobby to have, our sewing kit is the perfect compact kit to have lying around in your uni home. Show off you new talent to your friends. Suitable as a travel sewing kit.', '0', '', '');
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('2', 'Ah Tong Tailor', 'Advanced Sewing Kits', '39.9', '72ccbdae-d35f-4285-bb38-1780c570eb3e.jpeg', 'The advanced sewing kits, for the pros, and sews on a day to day basis.', '5', '', '');
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('3', 'Ah Tong Tailor', 'Moana Knitted Pouf', '69.9', '75e14cf5-a061-4ac7-b0d1-7afd9bc45b70.png', 'Create a soft, comfy ambience to your space with the Moana Knitted Pouf! A creative alternative for an extra seat in your home, Moana is uniquely hand-knitted and crafted for that laid back feel to your room. It is stuffed with EPS balls; a comfortable yet sturdy seat for anyone! It can be used as a seat, foot rest or even side table - get creative!', '10', 'Colour', 'radiobtn');
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('4', 'Ah Tong Tailor', 'Handmade Hello Kitty Mask', '9.9', 'af6e96f3-ef67-450f-9497-382d7d702520.jpeg', 'Handmade by in-store tailors, definitely top quality!', '0', '', '');
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('5', 'Ah Tong Tailor', 'Altering of Height', '10', '9686b138-457a-4786-9807-48f83e2adc2f.png', 'Clothes too long? Fear not, we will help you to alter according to your fit!', '30', 'Alter by (CM)', 'textbox');
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('6', 'Ah Tong Tailor', 'Customised Pants', '120', 'de62b797-e671-4bec-8087-21878afd955b.png', 'Need a business pants to tailor to your needs? Here we have the highest quality of pants!', '20', 'Leg Width', 'textbox');
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('7', 'Chong Boon Market Tapering Store', 'Customised Suit', '268', '3743b45a-98b4-42b2-bfa0-c392d9149bb5.jpeg', 'Customise your suits to your liking.', '0', 'Colour', 'radiobtn');

-- Chats
INSERT INTO `tailornowdb`.`chats` (`id`, `sender`, `recipient`, `senderstatus`, `recipientstatus`) VALUES ('4', 'customer1', 'Ah Tong Tailor', 'Unread', 'Unread');
INSERT INTO `tailornowdb`.`chats` (`id`, `sender`, `recipient`, `senderstatus`, `recipientstatus`) VALUES ('6', 'customer2', 'Ah Tong Tailor', 'Unread', 'blocked');
INSERT INTO `tailornowdb`.`chats` (`id`, `sender`, `recipient`, `senderstatus`, `recipientstatus`) VALUES ('7', 'customer1', 'Chong Boon Market Tapering Store', 'Read', 'Unread');

-- Messages
INSERT INTO `tailornowdb`.`messages` (`id`, `sentby`, `timestamp`, `message`, `chatId`) VALUES ('2', 'customer1', '17 August 2021 6:36 PM', 'hello', '4');
INSERT INTO `tailornowdb`.`messages` (`id`, `sentby`, `timestamp`, `message`, `chatId`) VALUES ('3', 'Ah Tong Tailor', '17 August 2021 6:36 PM', 'hi, how may i help u?', '4');
INSERT INTO `tailornowdb`.`messages` (`id`, `sentby`, `timestamp`, `upload`, `chatId`) VALUES ('4', 'customer1', '17 August 2021 6:36 PM', 'ab7cdfba-ba30-4e1d-a0bc-61abd2b544b0.jpeg', '4');
INSERT INTO `tailornowdb`.`messages` (`id`, `sentby`, `timestamp`, `message`, `chatId`) VALUES ('5', 'customer1', '17 August 2021 6:54 PM', 'The pants you sewed is not good, I nearly died because of it!!! I want a refund!', '4');
INSERT INTO `tailornowdb`.`messages` (`id`, `sentby`, `timestamp`, `message`, `chatId`) VALUES ('8', 'customer2', '18 August 2021 6:57 AM', 'Hello', '6');
INSERT INTO `tailornowdb`.`messages` (`id`, `sentby`, `timestamp`, `upload`, `chatId`) VALUES ('9', 'customer2', '18 August 2021 6:58 AM', '8d713052-f797-4d20-bafd-7744a1aa6e1a.jpeg', '6');
INSERT INTO `tailornowdb`.`messages` (`id`, `sentby`, `timestamp`, `message`, `chatId`) VALUES ('10', 'customer2', '18 August 2021 8:36 AM', 'Hello', '6');
INSERT INTO `tailornowdb`.`messages` (`id`, `sentby`, `timestamp`, `message`, `chatId`) VALUES ('11', 'Ah Tong Tailor', '18 August 2021 8:36 AM', 'Hi', '6');

-- Catalouges
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('1', 'Ah Tong Tailor', 'Portable Sewing Kit', '5', 'de9f7110-35c1-4ceb-b291-ff943aa9d128.jpeg', 'It\'s always handy to have a needle and thread around. Especially when you\'re away from home and can\'t rely on your parents to sew your buttons back on! A handy hobby to have, our sewing kit is the perfect compact kit to have lying around in your uni home. Show off you new talent to your friends. Suitable as a travel sewing kit.', '0', '', '');
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('2', 'Ah Tong Tailor', 'Advanced Sewing Kits', '39.9', '72ccbdae-d35f-4285-bb38-1780c570eb3e.jpeg', 'The advanced sewing kits, for the pros, and sews on a day to day basis.', '5', '', '');
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('3', 'Ah Tong Tailor', 'Moana Knitted Pouf', '69.9', '75e14cf5-a061-4ac7-b0d1-7afd9bc45b70.png', 'Create a soft, comfy ambience to your space with the Moana Knitted Pouf! A creative alternative for an extra seat in your home, Moana is uniquely hand-knitted and crafted for that laid back feel to your room. It is stuffed with EPS balls; a comfortable yet sturdy seat for anyone! It can be used as a seat, foot rest or even side table - get creative!', '10', 'Colour', 'radiobtn');
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('4', 'Ah Tong Tailor', 'Handmade Hello Kitty Mask', '9.9', 'af6e96f3-ef67-450f-9497-382d7d702520.jpeg', 'Handmade by in-store tailors, definitely top quality!', '0', '', '');
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('5', 'Ah Tong Tailor', 'Altering of Height', '10', '9686b138-457a-4786-9807-48f83e2adc2f.png', 'Clothes too long? Fear not, we will help you to alter according to your fit!', '30', 'Alter by (CM)', 'textbox');
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('6', 'Ah Tong Tailor', 'Customised Pants', '120', 'de62b797-e671-4bec-8087-21878afd955b.png', 'Need a business pants to tailor to your needs? Here we have the highest quality of pants!', '20', 'Leg Width', 'textbox');
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('9', 'Chong Boon Market Tapering Store', 'Customised Suit', '230', '390920b0-d39a-4c65-b962-90fc3a572944.jpeg', '', '0', 'Colour', 'radiobtn');
INSERT INTO `tailornowdb`.`catalouges` (`id`, `storename`, `name`, `price`, `image`, `description`, `discount`, `customqn`, `customcat`) VALUES ('10', 'Ah Tong Tailor', 'Customised Suit', '200', '5517cd05-17f9-4cd8-ac05-e7f284d3b294.jpeg', '', '20', 'Colour', 'radiobtn');

-- Productchoices
INSERT INTO `tailornowdb`.`productchoices` (`id`, `choice`, `catalougeId`) VALUES ('1', 'Yellow', '3');
INSERT INTO `tailornowdb`.`productchoices` (`id`, `choice`, `catalougeId`) VALUES ('2', 'Crimson', '3');
INSERT INTO `tailornowdb`.`productchoices` (`id`, `choice`, `catalougeId`) VALUES ('3', 'Peacock', '3');
INSERT INTO `tailornowdb`.`productchoices` (`id`, `choice`, `catalougeId`) VALUES ('4', 'Tiffany Blue', '3');
INSERT INTO `tailornowdb`.`productchoices` (`id`, `choice`, `catalougeId`) VALUES ('5', 'Light Grey', '3');
INSERT INTO `tailornowdb`.`productchoices` (`id`, `choice`, `catalougeId`) VALUES ('13', 'Blue', '9');
INSERT INTO `tailornowdb`.`productchoices` (`id`, `choice`, `catalougeId`) VALUES ('14', 'Navy', '9');
INSERT INTO `tailornowdb`.`productchoices` (`id`, `choice`, `catalougeId`) VALUES ('15', 'Black', '9');
INSERT INTO `tailornowdb`.`productchoices` (`id`, `choice`, `catalougeId`) VALUES ('16', 'Blue', '10');
INSERT INTO `tailornowdb`.`productchoices` (`id`, `choice`, `catalougeId`) VALUES ('17', 'Black', '10');
INSERT INTO `tailornowdb`.`productchoices` (`id`, `choice`, `catalougeId`) VALUES ('18', 'Navy', '10');

-- Review
INSERT INTO `tailornowdb`.`reviews` (`id`, `username`, `storename`, `photo`, `review`, `stars`, `timestamp`, `productid`) VALUES ('1', 'customer1', 'Ah Tong Tailor', 'd1c4e54e-4801-41b1-bc3d-c0df2f0d27eb.jpeg', 'Not very good quality...', '3', '17 August 2021 10:42 PM', '1');
INSERT INTO `tailornowdb`.`reviews` (`id`, `username`, `storename`, `photo`, `review`, `stars`, `timestamp`, `productid`) VALUES ('2', 'customer1', 'Ah Tong Tailor', '', '', '3', '17 August 2021 10:42 PM', '1');
INSERT INTO `tailornowdb`.`reviews` (`id`, `username`, `storename`, `photo`, `review`, `stars`, `timestamp`, `productid`) VALUES ('3', 'customer2', 'Ah Tong Tailor', '', 'This pouf is of a decent quality, but overly big to use.', '4', '18 August 2021 7:08 AM', '3');
INSERT INTO `tailornowdb`.`reviews` (`id`, `username`, `storename`, `photo`, `review`, `stars`, `timestamp`, `productid`) VALUES ('4', 'customer2', 'Chong Boon Market Tapering Store', '', '', '5', '18 August 2021 7:09 AM', '9');
INSERT INTO `tailornowdb`.`reviews` (`id`, `username`, `storename`, `photo`, `review`, `stars`, `timestamp`, `productid`) VALUES ('6', 'customer2', 'Ah Tong Tailor', '23b96e7e-a418-4980-8b46-88eb94201020.jpeg', '', '4', '18 August 2021 8:40 AM', '2');

-- Notification
INSERT INTO `tailornowdb`.`notifications` (`id`, `hyperlink`, `category`, `message`, `recipient`, `status`, `time`) VALUES ('39', 'tailor/addproduct', 'category', 'Welcome to TailorNow! Click here to start your store!', 'ahtong', 'Read', '16 August 2021 11:19 PM');
INSERT INTO `tailornowdb`.`notifications` (`id`, `hyperlink`, `category`, `message`, `recipient`, `status`, `time`) VALUES ('40', 'customer/homecust', 'category', 'Welcome to TailorNow!', 'customer2', 'Read', '16 August 2021 11:21 PM');
INSERT INTO `tailornowdb`.`notifications` (`id`, `hyperlink`, `category`, `message`, `recipient`, `status`, `time`) VALUES ('41', 'customer/homecust', 'category', 'Welcome to TailorNow!', 'customer1', 'Read', '16 August 2021 11:21 PM');
INSERT INTO `tailornowdb`.`notifications` (`id`, `hyperlink`, `category`, `message`, `recipient`, `status`, `time`) VALUES ('42', 'customer/homecust', 'category', 'Welcome to TailorNow!', 'rider1', 'Unread', '16 August 2021 11:21 PM');
INSERT INTO `tailornowdb`.`notifications` (`id`, `hyperlink`, `category`, `message`, `recipient`, `status`, `time`) VALUES ('43', 'customer/homecust', 'category', 'Welcome to TailorNow!', 'ahtong', 'Read', '16 August 2021 11:21 PM');
INSERT INTO `tailornowdb`.`notifications` (`id`, `hyperlink`, `category`, `message`, `recipient`, `status`, `time`) VALUES ('44', 'viewshops', 'category', 'get 10% off with 10OFF', 'admin', 'Read', '17 August 2021 10:54 PM');
INSERT INTO `tailornowdb`.`notifications` (`id`, `hyperlink`, `category`, `message`, `recipient`, `status`, `time`) VALUES ('45', 'viewshops', 'category', 'Get 15% off with “15OFFALL”', 'customer2', 'Read', '18 August 2021 8:39 AM');

-- Billingdetails
INSERT INTO `tailornowdb`.`billingdetails` (`id`, `firstname`, `lastname`, `username`, `address1`, `address2`, `city`, `postalcode`, `email`, `phoneno`, `deliverytime`, `deliverydate`, `shopname`, `OrderStatus`, `carttimestamp`, `tstatus`) VALUES ('1', 'Lee', 'Sian Long', 'customer2', '587 Ang Mo Kio Ave 3', '#05-513', 'Singapore', '560587', 'leesianlong@gmail.com', '81234567', '0900-1000', '2021-08-16 16:00:00', 'Ah Tong Tailor', 'pending', '1629203486', 'done');
INSERT INTO `tailornowdb`.`billingdetails` (`id`, `firstname`, `lastname`, `username`, `address1`, `address2`, `city`, `postalcode`, `email`, `phoneno`, `deliverytime`, `deliverydate`, `shopname`, `OrderStatus`, `carttimestamp`, `tstatus`) VALUES ('2', 'Lee', 'Sian Long', 'customer2', '587 Ang Mo Kio Ave 3', '#05-513', 'Singapore', '560587', 'leesianlong@gmail.com', '81234567', '0900-1000', '2021-08-16 16:00:00', 'Ah Tong Tailor', 'accepted', '1629204393', 'pending');
INSERT INTO `tailornowdb`.`billingdetails` (`id`, `firstname`, `lastname`, `username`, `address1`, `address2`, `city`, `postalcode`, `email`, `phoneno`, `deliverytime`, `deliverydate`, `shopname`, `OrderStatus`, `carttimestamp`) VALUES ('3', 'Kai', 'Kai', 'customer2', '618 Ang Mo Kio Ave 4', '#07-2923', 'Singapore', '560618', 'kaikai@gmail.com', '81589736', '0900-1000', '2021-08-16 16:00:00', 'Ah Tong Tailor', 'pending', '1629205993');
INSERT INTO `tailornowdb`.`billingdetails` (`id`, `firstname`, `lastname`, `username`, `address1`, `address2`, `city`, `postalcode`, `email`, `phoneno`, `deliverytime`, `deliverydate`, `OrderStatus`, `carttimestamp`) VALUES ('4', 'Kai', 'Kai', 'customer2', '618 Ang Mo Kio Ave 4', '#07-2923', 'Singapore', '560618', 'kaikai@gmail.com', '81589736', '0900-1000', '2021-08-17 16:00:00', 'pending', '1629247329');
INSERT INTO `tailornowdb`.`billingdetails` (`id`, `firstname`, `lastname`, `username`, `address1`, `address2`, `city`, `postalcode`, `email`, `phoneno`, `deliverytime`, `deliverydate`, `OrderStatus`, `carttimestamp`) VALUES ('5', 'Kai', 'Kai', 'customer2', '618 Ang Mo Kio Ave 4', '#07-2923', 'Singapore', '560618', 'kaikai@gmail.com', '81589736', '0900-1000', '2021-08-17 16:00:00', 'pending', '1629247615');

-- Advertisements
INSERT INTO `tailornowdb`.`advertisements` (`id`, `userId`, `storename`, `Image`, `startDate`, `endDate`, `adText`) VALUES ('1', '4', 'Ah Tong Tailor', 'b4608863-d7ff-4c43-916b-5a2f2291bede.jpeg', '2021-08-18 16:00:00', '2021-08-29 16:00:00', 'Support local, get 10% off.');
INSERT INTO `tailornowdb`.`advertisements` (`id`, `userId`, `storename`, `Image`, `startDate`, `endDate`, `adText`) VALUES ('2', '1', 'Chong Boon Market Tapering Store', '723686cc-6fcd-4980-9dfe-92912de16e57.jpeg', '2021-08-18 16:00:00', '2021-08-21 16:00:00', 'This is an Ad!');

-- Ridersorder
INSERT INTO `tailornowdb`.`ridersorders` (`id`, `cust_username`, `rider_username`, `des_address`, `pickup_address`, `deliverytime`, `deliverydate`, `deliveryfee`, `OrderStatus`, `TimeOrdersCompleted`) VALUES ('1', 'customer2', 'rider1', '587 Ang Mo Kio Ave 3#05-513Singapore560587', '713 Ang Mo Kio Ave 6#01-562Singapore560713', '0900-1000', '20210816160000', '3.6', 'pending', 'Wed Aug 18 2021 08:53:37 GMT+0800 (Singapore Standard Time)');
INSERT INTO `tailornowdb`.`ridersorders` (`id`, `cust_username`, `rider_username`, `des_address`, `pickup_address`, `deliverytime`, `deliverydate`, `deliveryfee`, `OrderStatus`, `TimeOrdersCompleted`) VALUES ('2', 'customer2', 'rider1', '618 Ang Mo Kio Ave 4#07-2923Singapore560618', '713 Ang Mo Kio Ave 6#01-562Singapore560713', '0900-1000', '20210816160000', '2.6', 'pending', 'Wed Aug 18 2021 08:53:13 GMT+0800 (Singapore Standard Time)');
INSERT INTO `tailornowdb`.`ridersorders` (`id`, `cust_username`, `rider_username`, `des_address`, `pickup_address`, `deliverytime`, `deliverydate`, `deliveryfee`, `OrderStatus`) VALUES ('3', 'customer2', 'rider1', '587 Ang Mo Kio Ave 3#05-513Singapore560587', '713 Ang Mo Kio Ave 6#01-562Singapore560713', '0900-1000', '20210816160000', '3.6', 'accepted');

-- Cart
INSERT INTO `tailornowdb`.`carts` (`id`, `name`, `price`, `quantity`, `customqn`, `custom`, `timestamp`, `userid`) VALUES ('1', 'Altering of Height', '7', '1', 'Alter by (CM)', '5', '1629203486', '6');
INSERT INTO `tailornowdb`.`carts` (`id`, `name`, `price`, `quantity`, `customqn`, `custom`, `timestamp`, `userid`) VALUES ('2', 'Altering of Height', '7', '1', 'Alter by (CM)', '5', '1629204393', '6');
INSERT INTO `tailornowdb`.`carts` (`id`, `name`, `price`, `quantity`, `customqn`, `custom`, `timestamp`, `userid`) VALUES ('3', 'Customised Pants', '96', '1', 'Leg Width', '3', '1629204393', '6');
INSERT INTO `tailornowdb`.`carts` (`id`, `name`, `price`, `quantity`, `customqn`, `custom`, `timestamp`, `userid`) VALUES ('4', 'Moana Knitted Pouf', '62.91', '2', 'Colour', '', '1629205993', '2');
INSERT INTO `tailornowdb`.`carts` (`id`, `name`, `price`, `quantity`, `customqn`, `custom`, `timestamp`, `userid`) VALUES ('5', 'Customised Pants', '96', '1', 'Leg Width', '4', '1629205993', '2');
INSERT INTO `tailornowdb`.`carts` (`id`, `name`, `price`, `quantity`, `customqn`, `timestamp`, `userid`) VALUES ('6', 'Portable Sewing Kit', '5', '1', 'Nil', '1629247329', '2');
INSERT INTO `tailornowdb`.`carts` (`id`, `name`, `price`, `quantity`, `customqn`, `custom`, `timestamp`, `userid`) VALUES ('7', 'Altering of Height', '7', '1', 'Alter by (CM)', '5', '1629247329', '2');
INSERT INTO `tailornowdb`.`carts` (`id`, `name`, `price`, `quantity`, `customqn`, `custom`, `timestamp`, `userid`) VALUES ('8', 'Customised Pants', '96', '2', 'Leg Width', '4', '1629247329', '2');
INSERT INTO `tailornowdb`.`carts` (`id`, `name`, `price`, `quantity`, `customqn`, `custom`, `timestamp`, `userid`) VALUES ('9', 'Customised Suit', '100', '4', 'Colour', 'Navy', '1629247615', '6');

-- Deals
INSERT INTO `tailornowdb`.`deals` (`id`, `catid`, `discountp`, `event`, `dstartdate`, `dexpirydate`, `userID`) VALUES ('1', '7', '20.00', 'New Store Opening', '2021-08-18 00:00:00', '2021-08-17 23:59:59', '1');
INSERT INTO `tailornowdb`.`deals` (`id`, `catid`, `discountp`, `event`, `dstartdate`, `dexpirydate`, `userID`) VALUES ('2', '4', '5.50', 'New Store Opening', '2021-08-18 00:00:00', '2021-08-17 23:59:59', '4');
INSERT INTO `tailornowdb`.`deals` (`id`, `catid`, `discountp`, `event`, `dstartdate`, `dexpirydate`, `userID`) VALUES ('3', '9', '100.00', 'New Store Opening', '2021-08-18 00:00:00', '2021-08-17 23:59:59', '1');
INSERT INTO `tailornowdb`.`deals` (`id`, `catid`, `discountp`, `event`, `dstartdate`, `dexpirydate`, `userID`) VALUES ('4', '3', '6.00', '9.9 Flash Sales', '2021-09-09 00:00:00', '2021-09-08 23:59:59', '4');

-- Vouchers
INSERT INTO `tailornowdb`.`vouchers` (`id`, `code`, `description`, `discount`, `minpurchase`, `quantity`, `vstartdate`, `vexpirydate`) VALUES ('2', 'OVER100', 'Spend over $100', '40', '100', '100', '2021-08-19 16:00:00', '2021-08-27 16:00:00');

-- Targets
INSERT INTO `tailornowdb`.`targets` (`id`, `value`, `userid`) VALUES ('1', '200', '1');

-- Course
INSERT INTO `tailornowdb`.`courses` (`id`, `ctitle`, `language`, `day`, `material`, `description`, `price`, `thumbnail`, `user`) VALUES ('10', 'Embroidery Skills', 'english', 'monday', 'Please prepare the following materials: embroidery hoop (ring consisting of two parts),  scissors, the fabric of your choice, embroidery floss', 'This course will teach you the very basics of hand embroidery. Learning to embroider is easier than you might think! If you\'re a lover of crafting while watching TV or listening to music, embroidery is a nice relaxing thing to do after a long day! ', '50', 'emb.jpg', '4');
INSERT INTO `tailornowdb`.`courses` (`id`, `ctitle`, `language`, `day`, `material`, `description`, `price`, `thumbnail`, `user`) VALUES ('11', 'Easy Fix Sewing Skills', 'english', 'monday', ' Please prepare the following materials for easy following of tutorial videos: scrap cloth, needle, thread, scissors \r\n', ' Interested in learning different sewing techniques? This course will allow you to learn how to easily patch up tears or holes in your clothes in a matter of minutes!\r\n', '30', 'stitch.jpg', '1');
INSERT INTO `tailornowdb`.`courses` (`id`, `ctitle`, `language`, `day`, `material`, `description`, `price`, `thumbnail`, `user`) VALUES ('12', 'How to Use A Sewing Machine', 'english', 'monday', 'You will need a sewing machine, cloth, thread, scissors', 'Unsure of how to use a sewing machine, this course will teach you how to easily use a sewing machine and basic sewing patterns you can sew using the machine!', '25', 'macbine.jpg', '1');
INSERT INTO `tailornowdb`.`courses` (`id`, `ctitle`, `language`, `day`, `material`, `description`, `price`, `thumbnail`, `user`) VALUES ('14', 'Dressmaking ', 'english', 'monday', 'Your choice of fabric, sewing machine, scissors, needle, thread', 'If you have tailoring skills but is unsure of what to make, this course will teach you how to put your skills into use! Make your first ever dress with us.', '100', 'dmaking.jpg', '1');
INSERT INTO `tailornowdb`.`courses` (`id`, `ctitle`, `language`, `day`, `material`, `description`, `price`, `thumbnail`, `user`) VALUES ('15', 'Crocheting Techniques', 'english', 'monday', 'Materials you will need will be: yarn, crochet hooks, tapestry needle, stitch markers (optional)\r\n', 'Unsure of how to crochet? This course will teach you the basics of crocheting techniques! Skills learnt in this course will give you extra tips and tricks that will make your crocheting learning much easier. ', '40', 'crochet.jpg', '4');


--VideoContents

INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('3', 'Needle Lace', 'stitch2.mp4', '11');
INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('4', 'Tatting', 'easystitch.mp4', '11');
INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('5', 'Introduction', 'emb.mp4', '10');
INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('6', 'Setting Up', 'embr2.mp4', '10');
INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('10', 'Setting Up', 'mach.mp4', '12');
INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('11', 'Testing it Out', 'ine.mp4', '12');
INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('12', 'Staystitch', 'machine.mp4', '12');
INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('13', 'Broomstick Lace', 'cr1.mp4', '13');
INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('14', 'Pineapple Lace ', 'cr2.mp4', '13');
INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('15', 'Measurements', 'dm.mp4', '14');
INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('16', 'Sections of Dress', 'dmak.mp4', '14');
INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('17', 'Sewing Together', 'dking.mp4', '14');
INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('18', 'Introduction', 'cr1.mp4', '15');
INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('19', 'Double Ended ', 'cr2.mp4', '15');
INSERT INTO `tailornowdb`.`videocontents` (`id`, `topic`, `video`, `courseid`) VALUES ('20', 'Broomstick Lace', 'croceht.mp4', '15');

--Cals (Calendar tasks)
INSERT INTO `tailornowdb`.`cals` (`id`, `eventtitle`, `startdate`, `enddate`, `note`, `user`) VALUES ('6', ' Shorten Sleeve Order', '2021-08-29 16:00:00', '2021-08-30 16:00:00', 'to complete by 31 aug\r\n', '4');
INSERT INTO `tailornowdb`.`cals` (`id`, `eventtitle`, `startdate`, `enddate`, `note`, `user`) VALUES ('7', 'Live Course w @Customer3', '2021-08-27 16:00:00', '2021-08-27 16:00:00', 'at own shop, 12pm. Embroidery course\r\n\r\n', '4');
INSERT INTO `tailornowdb`.`cals` (`id`, `eventtitle`, `startdate`, `enddate`, `note`, `user`) VALUES ('8', 'Complete Order 4', '2021-08-29 16:00:00', '2021-08-30 16:00:00', 'hemmings of skirt ', '4');
INSERT INTO `tailornowdb`.`cals` (`id`, `eventtitle`, `startdate`, `enddate`, `note`, `user`) VALUES ('11', 'Live Course w @Customer4', '2021-09-03 16:00:00', '2021-09-03 16:00:00', 'at own shop, 12pm. Embroidery course', '4');

--CoPay (Course Sign up)
INSERT INTO `tailornowdb`.`copays` (`id`, `courseid`, `price`, `tailor`, `ctitle`, `cuser`, `description`, `thumbnail`) VALUES ('11', '10', '50', 'Ah Tong Tailor', 'Embroidery Skills', '6', 'This course will teach you the very basics of hand embroidery. Learning to embroider is easier than you might think! If you\'re a lover of crafting while watching TV or listening to music, embroidery is a nice relaxing thing to do after a long day! ', 'emb.jpg');
INSERT INTO `tailornowdb`.`copays` (`id`, `courseid`, `price`, `tailor`, `ctitle`, `cuser`, `description`, `thumbnail`) VALUES ('12', '11', '30', 'Chong Boon Market Tapering Store', 'Easy Fix Sewing Skills', '6', ' Interested in learning different sewing techniques? This course will allow you to learn how to easily patch up tears or holes in your clothes in a matter of minutes!\r\n', 'stitch.jpg');
INSERT INTO `tailornowdb`.`copays` (`id`, `courseid`, `price`, `tailor`, `ctitle`, `cuser`, `description`, `thumbnail`) VALUES ('13', '14', '100', 'Chong Boon Market Tapering Store', 'Dressmaking ', '6', 'If you have tailoring skills but is unsure of what to make, this course will teach you how to put your skills into use! Make your first ever dress with us.', 'dmaking.jpg');
INSERT INTO `tailornowdb`.`copays` (`id`, `courseid`, `price`, `tailor`, `ctitle`, `cuser`, `description`, `thumbnail`) VALUES ('14', '15', '40', 'Ah Tong Tailor', 'Crocheting Techniques', '6', 'Unsure of how to crochet? This course will teach you the basics of crocheting techniques! Skills learnt in this course will give you extra tips and tricks that will make your crocheting learning much easier. ', 'crochet.jpg');
