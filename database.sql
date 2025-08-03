USE [master]
GO
CREATE DATABASE [Healthcare_ServiceVer997]
GO
USE [Healthcare_ServiceVer997]
GO
----------------------------------------------------------------------------------------------------------

CREATE TABLE Customer (
    cusId               INT             IDENTITY(1,1) CONSTRAINT PK_Customer PRIMARY KEY,
    cusFullName         NVARCHAR(100)   NULL,
    cusGender           CHAR(1)         CONSTRAINT CK_Customer_Gender CHECK (cusGender IN ('F','M')),
    cusDate             DATE            NULL,
    cusEmail            VARCHAR(100)    NULL,
    cusPhone            DECIMAL(10,0)   NULL,
    cusPassword         NVARCHAR(100)   NULL,
    cusAddress          NVARCHAR(100)   NULL,
    cusStatus           VARCHAR(20)     NOT NULL CONSTRAINT CK_Customer_Status CHECK (cusStatus IN ('inactive','active')),
    cusOccupation       NVARCHAR(100)   NULL,
    emergencyContact    NVARCHAR(100)   NULL,
    cusProvider         VARCHAR(20)     NOT NULL DEFAULT 'local',

    CONSTRAINT UQ_Customer_Email_Provider UNIQUE (cusEmail, cusProvider)
);
GO

CREATE TABLE Manager (
    maId        INT             IDENTITY(1,1) CONSTRAINT PK_Manager PRIMARY KEY,
    maFullName  NVARCHAR(100)   NOT NULL,
    maEmail     NVARCHAR(100)   NULL,
    maPhone     VARCHAR(20)     NULL,
    maPassword  NVARCHAR(100)   NOT NULL,
    position    NVARCHAR(50)    NULL,
    roles       VARCHAR(20)     NOT NULL CONSTRAINT CK_Manager_Roles CHECK (roles IN ('admin','manager')),	
);
GO

-- 3. Doctor
CREATE TABLE Doctor (
    docId               INT             IDENTITY(1,1)   CONSTRAINT PK_Doctor PRIMARY KEY,
    docFullName         NVARCHAR(100)   NULL,
    docEmail            VARCHAR(100)    NULL, 
    docPhone            VARCHAR(20)     NULL,
	docPassword			NVARCHAR(100)   NULL,
    expertise           NVARCHAR(100)   NULL, -- chuyen mon
    degree              NVARCHAR(500)   NULL,
    profileDescription  NVARCHAR(1000)  NULL,
	
);



-- 4. WorkSlot – khung gio lam viec cua bac si, moi slot 1 tieng, co 2 benh nhan
CREATE TABLE WorkSlot (
    slotId      INT             IDENTITY(1,1) CONSTRAINT PK_WorkSlot PRIMARY KEY,

    docId       INT             NOT NULL	CONSTRAINT FK_WorkSlot_Doctor
											FOREIGN KEY 
											REFERENCES Doctor(docId),

    maId        INT             NULL		CONSTRAINT FK_WorkSlot_Manager
											FOREIGN KEY 
											REFERENCES Manager(maId),
    workDate    DATE            NOT NULL,
    startTime   TIME            NOT NULL,
    endTime     TIME            NOT NULL,
    maxPatient  INT             NOT NULL, 

    slotStatus  NVARCHAR(20)    NOT NULL	CONSTRAINT CK_WorkSlot_Status CHECK (slotStatus IN ('pending','approved','cancelled'))
);
GO
-- 5. Service
CREATE TABLE Service (
    serId           INT             IDENTITY(1,1) CONSTRAINT PK_Service PRIMARY KEY,
    serName         NVARCHAR(100)   NULL,
    serDescription  NVARCHAR(500)   NULL,
    serPrice        DECIMAL(12,2)   NULL,
    duration        INT             NULL
);

CREATE TABLE DoctorService (
  docId		INT		 NOT NULL CONSTRAINT FK_DS_Doctor
							  FOREIGN KEY 
							  REFERENCES Doctor(docId),

  serId		INT		 NOT NULL CONSTRAINT FK_DS_Service 
							  FOREIGN KEY 
							  REFERENCES Service(serId),

  CONSTRAINT PK_DoctorService PRIMARY KEY (docId, serId)
);
GO
-- 6. SubService
CREATE TABLE SubService (
    subId               INT             IDENTITY(1,1) CONSTRAINT PK_SubService PRIMARY KEY,

    serId               INT             NOT NULL CONSTRAINT FK_SubService_Service 
												 FOREIGN KEY (serId) 
												 REFERENCES dbo.Service(serId),
    subName             NVARCHAR(100)   NOT NULL,
    subDescription      NVARCHAR(255)   NULL,
    estimatedDayOffset  INT             NULL, -- Ngay du kien thuc hien so voi ngay bat dau
    subPrice            INT             NOT NULL
);

GO

-- 7. Booking --De dat lich hen tu van, kham
CREATE TABLE Booking (
    bookId      INT             IDENTITY(1,1) CONSTRAINT PK_Booking PRIMARY KEY,

    cusId       INT             NOT NULL      CONSTRAINT FK_Booking_Customer
											  FOREIGN KEY (cusId)  
											  REFERENCES dbo.Customer(cusId),

    docId       INT             NOT NULL	  CONSTRAINT FK_Booking_Doctor
											  FOREIGN KEY (docId) 
											  REFERENCES dbo.Doctor(docId),
    
    slotId      INT             NOT NULL	 CONSTRAINT FK_Booking_Slot
											 FOREIGN KEY (slotId) 
											 REFERENCES dbo.WorkSlot(slotId),

    bookType    NVARCHAR(20)    NOT NULL CONSTRAINT CK_Booking_Type CHECK (bookType IN ('initial','follow-up'))
                                         CONSTRAINT DF_Booking_Type DEFAULT 'initial',

    bookStatus  NVARCHAR(20)    NOT NULL CONSTRAINT CK_Booking_Status CHECK (bookStatus IN ('pending','confirmed','completed','rejected'))
                                             CONSTRAINT DF_Booking_Status DEFAULT 'pending',

    createdAt   DATETIME        NOT NULL DEFAULT GETDATE(),
    note        NVARCHAR(1000)  NULL,

	serId      INT             NOT NULL		 CONSTRAINT FK_Booking_Service
											 FOREIGN KEY (serId) 
											 REFERENCES dbo.Service(serId), 
	drugId		INT			  NULL										 
);
GO

--8.  
-- Bang luu cac buoc thuc te cua mot lan kham/ dieu tri
CREATE TABLE BookingStep (
    bookingStepId	   INT            IDENTITY(1,1) CONSTRAINT PK_BookingStep PRIMARY KEY,

    bookId			   INT            NOT NULL,     CONSTRAINT FK_BookingStep_Appointment
												    FOREIGN KEY (bookId)
													REFERENCES Booking(bookId),

    subId              INT            NOT NULL,		CONSTRAINT FK_BookingStep_SubService
        FOREIGN KEY (subId)
        REFERENCES SubService(subId),
    performedAt        DATETIME       NULL,  -- Ngày bat dau thuc hien
    result             NVARCHAR(500)  NULL,  -- Ket qua xet nghiem
    note               NVARCHAR(500)  NULL,  -- Ghi chu cua bac si cho buoc nay
	stepStatus		   NVARCHAR(20)	  NOT NULL		CONSTRAINT CK_BookingStep_Status CHECK (stepStatus IN ('inactive','pending','completed'))
													CONSTRAINT DF_BookingStep_Status DEFAULT 'inactive',
);
GO

-- 9. MedicalRecord - benh an

CREATE TABLE MedicalRecord (
    recordId        INT   IDENTITY(1,1)  CONSTRAINT PK_MedicalRecord PRIMARY KEY,

    cusId           INT					 CONSTRAINT FK_MedicalRecord_Customer 
										 FOREIGN KEY (cusId) 
										 REFERENCES dbo.Customer(cusId),

    docId           INT					 CONSTRAINT FK_MedicalRecord_Doctor 
										 FOREIGN KEY (docId) 
										 REFERENCES dbo.Doctor(docId),

    serId           INT					 CONSTRAINT FK_MedicalRecord_Service 
										 FOREIGN KEY (serId) 
										 REFERENCES dbo.Service(serId),

    createdAt       DATETIME			 DEFAULT GETDATE(),

    recordStatus    NVARCHAR(20)   NOT NULL CONSTRAINT CK_MedicalRecord_Status CHECK (recordStatus IN ('active','closed','pending'))
											CONSTRAINT DF_MedicalRecord_Status DEFAULT 'active',
    note            NVARCHAR(1000) NULL,
    diagnosis       NVARCHAR(500)  NULL,  -- chuan doan benh
    treatmentPlan   NVARCHAR(1000) NULL,  -- Ke hoach dieu tri
    dischargeDate   DATETIME       NULL  -- ngay ket thuc dieu tri

);
GO
CREATE TABLE MedicalRecordBooking (-- để biết được các booking thuộc dịch vụ nào thông qua hồ sơ bệnh án của chính cái dịch vụ đó
    recordId	INT		NOT NULL		CONSTRAINT FK_MedicalRecordBooking_Record
										FOREIGN KEY (recordId) REFERENCES MedicalRecord(recordId),

    bookId		INT		NOT NULL		CONSTRAINT FK_MedicalRecordBooking_Booking
										FOREIGN KEY (bookId) REFERENCES Booking(bookId)
);
-- -- UNIQUE constraint để 1 booking chỉ gắn 1 lần với 1 record:
-- ALTER TABLE MedicalRecordBooking ADD CONSTRAINT UQ_RecordBooking UNIQUE (recordId, bookId);



-- 10. Feedback cua khach hang sau khi dieu tri
CREATE TABLE Feedback (
    feedbackId      INT			   IDENTITY(1,1) CONSTRAINT PK_Feedback PRIMARY KEY,

    cusId			INT            NOT NULL      CONSTRAINT FK_Feedback_Customer 
											     FOREIGN KEY (cusId)
												 REFERENCES Customer(cusId),

    docId			INT            NOT NULL      CONSTRAINT FK_Feedback_Doctor   
											     FOREIGN KEY (docId)
												 REFERENCES Doctor(docId),

    serId			INT            NOT NULL      CONSTRAINT FK_Feedback_Service  
												 FOREIGN KEY (serId)
												 REFERENCES Service(serId),

    rating			TINYINT        NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment			NVARCHAR(1000) NULL,
    feedbackDate  DATETIME DEFAULT GETDATE()
);
GO
CREATE TABLE Post (
    postId      INT             IDENTITY(1,1) CONSTRAINT PK_Post PRIMARY KEY,

    docId       INT             NOT NULL      CONSTRAINT FK_Post_Doctor
											  FOREIGN KEY (docId)
											  REFERENCES Doctor(docId),
    title       NVARCHAR(200)   NOT NULL,
    content     NVARCHAR(MAX)   NOT NULL,
    createdAt   DATETIME        NOT NULL	  DEFAULT GETDATE(),
    updatedAt   DATETIME        NULL,
    postStatus      NVARCHAR(20)    NOT NULL  CONSTRAINT CK_Post_Status CHECK (postStatus IN ('draft','published','hidden'))
											  DEFAULT 'draft',
    summary     NVARCHAR(500)   NULL
    
);
GO

CREATE TABLE Image (
    imageId        INT           IDENTITY(1,1) PRIMARY KEY,
    imageData      VARBINARY(MAX) NOT NULL,
    imageMimeType  NVARCHAR(100)  NOT NULL
);
GO

CREATE TABLE DoctorAvatar (
    docAvatarId INT IDENTITY(1,1) PRIMARY KEY,
    docId       INT NOT NULL
        CONSTRAINT FK_DoctorAvatar_Doctor FOREIGN KEY (docId) REFERENCES Doctor(docId),
    imageId     INT NOT NULL
        CONSTRAINT FK_DoctorAvatar_Image FOREIGN KEY (imageId) REFERENCES Image(imageId),
    isActive    BIT NOT NULL DEFAULT 0 , -- 0: không dùng, 1: đang dùng làm đại diện
	createdAt   DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE PostImage (
    postImageId INT IDENTITY(1,1)	PRIMARY KEY,
    postId      INT NOT NULL		CONSTRAINT FK_PostImage_Post
									FOREIGN KEY (postId) REFERENCES Post(postId),

    imageId     INT NOT NULL		CONSTRAINT FK_PostImage_Image
									FOREIGN KEY (imageId) REFERENCES Image(imageId)
);
GO


CREATE TABLE Drug (
    drugId          INT             IDENTITY(1,1) PRIMARY KEY,  -- ID duy nhất cho mỗi toa thuốc
    bookId			    INT             NOT NULL,                   -- Gắn với bước cụ thể của quá trình điều trị
    docId           INT             NOT NULL,                   -- Bác sĩ kê thuốc
    cusId           INT             NOT NULL,                   -- Bệnh nhân được kê thuốc
    drugNote        NVARCHAR(200)   NULL,                      
    createdAt       DATETIME        NULL,          -- Thời gian kê thuốc

    CONSTRAINT FK_Drug_Booking     FOREIGN KEY (bookId)		   REFERENCES Booking(bookId),
    CONSTRAINT FK_Drug_Doctor      FOREIGN KEY (docId)         REFERENCES Doctor(docId),
    CONSTRAINT FK_Drug_Customer    FOREIGN KEY (cusId)         REFERENCES Customer(cusId)
);
GO



CREATE TABLE DrugItem (
	drugItemId		  INT       IDENTITY(1,1)	PRIMARY KEY,

	drugId			    INT       NOT NULL		  CONSTRAINT FK_DrugItem_Drug
													                FOREIGN KEY (drugId)
													                REFERENCES Drug(drugId),

  drugName        NVARCHAR(100)   NULL,                   -- Tên thuốc
  dosage          NVARCHAR(50)    NULL,                   -- Liều dùng, ví dụ: "2 viên/lần"
  frequency       NVARCHAR(50)    NULL,                   -- Tần suất: "3 lần/ngày"
  duration        NVARCHAR(50)    NULL,                   -- Thời gian dùng: "5 ngày"
	drugItemNote    NVARCHAR(200)   NULL

);
GO

CREATE TABLE BookingRevenue (
    revenueId   INT           IDENTITY(1,1)       PRIMARY KEY,

    bookId      INT           NOT NULL            CONSTRAINT FK_BookingRevenue_Booking 
                                                  FOREIGN KEY (bookId) REFERENCES Booking(bookId),

    serId       INT           NOT NULL            CONSTRAINT FK_BookingRevenue_Service 
                                                  FOREIGN KEY (serId) REFERENCES Service(serId),

    totalAmount DECIMAL(12,2) NOT NULL,

    imageId     INT           NULL                CONSTRAINT FK_BookingRevenue_Image 
                                                  FOREIGN KEY (imageId) REFERENCES Image(imageId),

    revenueStatus      NVARCHAR(20) NOT NULL      CONSTRAINT CK_BookingRevenue_Status 
												  CHECK (revenueStatus IN ('pending', 'success')) DEFAULT 'pending',	

    createdAt   DATETIME NOT NULL DEFAULT GETDATE()
  );
  GO


CREATE TABLE BookingRevenueDetail (
    revenueDetailId INT				IDENTITY(1,1) PRIMARY KEY,
    bookId			INT				NOT NULL	  CONSTRAINT FK_BookingRevenueDetail_Booking 
												  FOREIGN KEY (bookId) REFERENCES Booking(bookId),

    serId			INT				NOT NULL	  CONSTRAINT FK_BookingRevenueDetail_Servic				
												  FOREIGN KEY (serId) REFERENCES Service(serId),

    subId			INT				NOT NULL      CONSTRAINT FK_BookingRevenueDetail_SubService
												  FOREIGN KEY (subId) REFERENCES SubService(subId),

    subPrice		DECIMAL(12,2)	NOT NULL,
    createdAt		DATETIME		NOT NULL	  DEFAULT GETDATE()
);
GO

CREATE TABLE PaymentImage (
    paymentImageId INT       IDENTITY(1,1) PRIMARY KEY,

    revenueId      INT       NOT NULL      CONSTRAINT FK_PaymentImage_BookingRevenue
                                           FOREIGN KEY (revenueId) REFERENCES BookingRevenue(revenueId),

    imageId        INT       NOT NULL      CONSTRAINT FK_PaymentImage_Image
                                           FOREIGN KEY (imageId) REFERENCES Image(imageId),

    uploadedAt     DATETIME  NOT NULL      DEFAULT GETDATE(),

    note           NVARCHAR(255) NULL      -- ghi chú (ví dụ: "biên lai chuyển khoản lần 1")
);
GO

INSERT INTO Customer ( cusFullName, cusGender, cusDate, cusEmail, cusPhone, cusPassword, cusAddress, cusStatus,  cusOccupation,  emergencyContact)
VALUES (N'Trần Anh Thư','F', '2004-09-26','thutase180353@fpt.edu.vn', '0352020737', N'$2a$10$.C1rQAp36kaZsn09oleNlO9DKYuN1S5r0g9BByrz1oSFgwDhn83Oy',  N'HCMC','active', N'Con sen', N'Mơ' --mk:123@
);

INSERT INTO Doctor (docFullName, docEmail, docPhone, docPassword, expertise, degree, profileDescription)
VALUES (N'Nguyễn Ngọc Khánh Linh', 'doc1@gmail.com', '123',N'$2a$10$.C1rQAp36kaZsn09oleNlO9DKYuN1S5r0g9BByrz1oSFgwDhn83Oy' , N'Khám, tư vấn và thực hiện các kỹ thuật điều trị vô sinh – hiếm muộn, hỗ trợ sinh sản.', N'Tiến sĩ Sản Phụ khoa', N'Tiến sĩ Nguyễn Ngọc Khánh Linh là chuyên gia về kiểm soát chất lượng phôi và thụ tinh trong ống nghiệm, với hơn 12 năm công tác tại các trung tâm sinh sản hàng đầu.'),
(N'Trương Quốc Lập', 'doc2@gmail.com', '345',N'$2a$10$.C1rQAp36kaZsn09oleNlO9DKYuN1S5r0g9BByrz1oSFgwDhn83Oy', N'Khám, tư vấn và thực hiện các kỹ thuật điều trị vô sinh – hiếm muộn - Thụ tinh nhân tạo - IUI', N'Bác sĩ Chuyên khoa I Sản Phụ khoa', N'Bác sĩ Trương Quốc Lập  có 8 năm kinh nghiệm trong lĩnh vực IUI, đã hỗ trợ thành công nhiều cặp vợ chồng trên toàn quốc.'),
(N'Tất Vĩnh Hùng','doc3@gmail.com','567',N'$2a$10$.C1rQAp36kaZsn09oleNlO9DKYuN1S5r0g9BByrz1oSFgwDhn83Oy',N'Khám, tư vấn và thực hiện các kỹ thuật điều trị vô sinh – hiếm muộn - IVF',N'Thạc sĩ Sản Phụ khoa',N'Bác sĩ Tất Vĩnh Hùng có hơn 10 năm kinh nghiệm điều trị vô sinh – hiếm muộn, chuyên sâu về IVF tại các trung tâm hàng đầu.'),
(N'Phạm Thị Hồng Anh', 'doc4@gmail.com', '789',N'$2a$10$.C1rQAp36kaZsn09oleNlO9DKYuN1S5r0g9BByrz1oSFgwDhn83Oy', N'Khám, tư vấn và thực hiện các kỹ thuật điều trị vô sinh – hiếm muộn, hỗ trợ sinh sản.', N'Bác sĩ Chuyên khoa II Sản Phụ khoa', N'Bác sĩ Phạm Thị Hồng Anh là chuyên gia về thụ tinh trong ống nghiệm và hỗ trợ sinh sản, với 7 năm kinh nghiệm tại các trung tâm hỗ trợ sinh sản uy tín.'),
(N'Lê Minh Đức', 'doc5@gmail.com', '890',N'$2a$10$.C1rQAp36kaZsn09oleNlO9DKYuN1S5r0g9BByrz1oSFgwDhn83Oy', N'Khám, tư vấn và thực hiện các kỹ thuật điều trị vô sinh – hiếm muộn, hỗ trợ sinh sản.', N'Thạc sĩ Sản Phụ khoa',          N'Bác sĩ Lê Minh Đức chuyên sâu về điều trị vô sinh – hiếm muộn và hỗ trợ sinh sản, với 5 năm kinh nghiệm làm việc tại các bệnh viện đầu ngành.'),
(N'Trần Thị Tú','doc6@gmail.com', '901',N'$2a$10$.C1rQAp36kaZsn09oleNlO9DKYuN1S5r0g9BByrz1oSFgwDhn83Oy', N'Khám, tư vấn và thực hiện các kỹ thuật điều trị vô sinh – hiếm muộn, hỗ trợ sinh sản.', N'Tiến sĩ Sinh học Phôi',         N'Bác sĩ Trần Thị Tú là chuyên gia về kiểm soát chất lượng phôi và thụ tinh trong ống nghiệm, với hơn 8 năm kinh nghiệm tại các trung tâm hàng đầu.');
-- demo nen tat ca bac si deu co mk 123@

INSERT INTO Manager ( maFullName, maEmail, maPassword, maPhone, position, roles) VALUES						
('manager1', 'manager1@gmail.com',N'$2a$10$.C1rQAp36kaZsn09oleNlO9DKYuN1S5r0g9BByrz1oSFgwDhn83Oy', 0123456789, 'tanker', 'manager'),
('admin1', 'admin1@gmail.com',N'$2a$10$.C1rQAp36kaZsn09oleNlO9DKYuN1S5r0g9BByrz1oSFgwDhn83Oy', 0123456789, 'ad', 'admin')
-- pass là 123@	



INSERT INTO Service (serName, serDescription, serPrice, duration)
VALUES (N'Khám tiền đăng ký điều trị IVF-IUI', N'Tư vấn chuyên sâu và chẩn đoán tình trạng sinh sản, xác định phương án điều trị phù hợp cho cả nam và nữ', 3100000, 7),
(N'Liệu trình điều trị IVF', N'Quy trình thụ tinh trong ống nghiệm: kích thích buồng trứng, chọc hút noãn, thụ tinh và chuyển phôi', 20700000, 30),
(N'Liệu trình điều trị IUI', N'Quy trình bơm tinh trùng vào buồng tử cung, tối ưu tỉ lệ thụ thai tự nhiên', 3750000, 30);

INSERT INTO DoctorService (docId, serId)
VALUES
  (1, 1), 
  (1, 2),  
  (1, 3),
  (2, 1),
  (2, 2),
  (2, 3),
  (3, 1),
  (3, 2),
  (3, 3), --  
  (4, 1), -- 
  (4, 2), -- 
  (4, 3), --
  (5, 1), -- 
  (5, 2), -- 
  (5, 3), --
  (6, 1), -- 
  (6, 2), -- 
  (6, 3); --

-- Sub‐services cho Khám tiền đăng ký điều trị (serId = 1)
INSERT INTO SubService (serId, subName, subDescription, estimatedDayOffset, subPrice)
VALUES
  (1, N'Khám lâm sàng tổng quát',    N'Đánh giá sức khỏe sinh sản tổng thể cho vợ-chồng',    1, 200000),
  (1, N'Khám chuyên khoa nam-nữ',    N'Khám chi tiết bộ phận sinh dục nam hoặc nữ',          1, 250000),
  (1, N'Xét nghiệm AMH (dự trữ buồng trứng)', N'Đánh giá dự trữ buồng trứng ở nữ',               2, 500000),
  (1, N'Xét nghiệm nội tiết tố nữ (FSH, LH, E2)', N'Kiểm tra hormone sinh sản nữ',               2, 300000),
  (1, N'Xét nghiệm tinh dịch đồ',    N'Đánh giá chất lượng tinh trùng nam',                2, 300000),
  (1, N'Xét nghiệm máu, viêm gan, HIV, giang mai', N'Tầm soát các bệnh truyền nhiễm',            2, 400000),
  (1, N'Siêu âm tử cung, buồng trứng',N'Kiểm tra cấu trúc tử cung và dự trữ noãn',            2, 250000),
  (1, N'Chụp HSG/siêu âm vòi trứng', N'Kiểm tra thông vòi trứng ở nữ',                     3, 700000),
  (1, N'Tư vấn kết quả, định hướng điều trị', N'Tư vấn phác đồ IVF-IUI hoặc hướng điều trị khác', 3, 200000);

-- Sub‐services cho Liệu trình điều trị IVF (serId = 2)
INSERT INTO SubService (serId, subName, subDescription, estimatedDayOffset, subPrice)
VALUES
  (2, N'Kích thích buồng trứng',      N'Tiêm thuốc, theo dõi nang noãn',               1, 600000),
  (2, N'Siêu âm noãn',                 N'Theo dõi nang noãn phát triển',                 3, 250000),
  (2, N'Tiêm hCG',                     N'Kích thích trưởng thành noãn, chuẩn bị chọc trứng', 8, 300000),
  (2, N'Chọc hút trứng',               N'Lấy trứng ra khỏi buồng trứng',                 10, 7000000),
  (2, N'Lấy tinh trùng',              N'Lấy mẫu tinh trùng vào ngày chọc trứng',        10, 1000000),
  (2, N'Tạo phôi, nuôi phôi trong lab',N'Nuôi cấy và chọn lọc phôi',                     11, 5000000),
  (2, N'Chuyển phôi',                  N'Đưa phôi vào buồng tử cung',                    15, 6000000),
  (2, N'Thử β-hCG',                    N'Xét nghiệm kiểm tra thai sau chuyển phôi',      22, 200000),
  (2, N'Siêu âm tim thai',             N'Theo dõi sự phát triển của thai (nếu có)',      29, 350000);

-- Sub‐services cho Liệu trình điều trị IUI (serId = 3)
INSERT INTO SubService (serId, subName, subDescription, estimatedDayOffset, subPrice)
VALUES
  (3, N'Kích thích buồng trứng nhẹ',   N'Tiêm thuốc nhẹ, theo dõi nang noãn',            1, 400000),
  (3, N'Siêu âm noãn',                 N'Theo dõi sự phát triển của nang noãn',           3, 200000),
  (3, N'Tiêm hCG',                     N'Định ngày rụng trứng',                          7, 200000),
  (3, N'Bơm tinh trùng vào buồng tử cung', N'Thực hiện thủ thuật IUI',                  8, 2500000),
  (3, N'Thử β-hCG',                    N'Xét nghiệm kiểm tra thai sau IUI',               22, 200000),
  (3, N'Siêu âm túi thai',             N'Theo dõi sự phát triển của thai (nếu có)',      29, 250000);

