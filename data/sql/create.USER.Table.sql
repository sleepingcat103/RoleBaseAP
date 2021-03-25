SET ANSI_NULLS ON

SET QUOTED_IDENTIFIER ON

CREATE TABLE [dbo].[USER](
	[USER_ID] [varchar](50) NOT NULL,
	[PASSWORD] [varchar](100) NULL,
	[DIRECT_LOGIN] [tinyint] NOT NULL,
	[ACTIVE] [tinyint] NOT NULL,
	[ADMIN] [tinyint] NOT NULL,
	[MEMO] [nvarchar](1500) NULL,
	[CREATE_TIME] [datetimeoffset](7) NOT NULL,
	[LAST_UPDATE_TIME] [datetimeoffset](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[USER_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[USER] ADD  DEFAULT ((0)) FOR [ADMIN]

ALTER TABLE [dbo].[USER] ADD  DEFAULT ((0)) FOR [DIRECT_LOGIN]

ALTER TABLE [dbo].[USER] ADD  DEFAULT ((1)) FOR [ACTIVE]

ALTER TABLE [dbo].[USER] ADD  DEFAULT (getdate()) FOR [CREATE_TIME]

ALTER TABLE [dbo].[USER] ADD  DEFAULT (getdate()) FOR [LAST_UPDATE_TIME]