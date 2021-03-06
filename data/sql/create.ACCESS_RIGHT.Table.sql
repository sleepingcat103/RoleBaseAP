SET ANSI_NULLS ON

SET QUOTED_IDENTIFIER ON

CREATE TABLE [dbo].[ACCESS_RIGHT](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[PROJECT_ID] [varchar](50) NOT NULL,
	[ROLE_ID] [varchar](50) NOT NULL,
	[FEATURE_ID] [varchar](50) NOT NULL,
	[ACCESS_LAYER] [varchar](50) NULL,
	[CREATE_TIME] [datetimeoffset](7) NOT NULL,
	[LAST_UPDATE_TIME] [datetimeoffset](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[ACCESS_RIGHT] WITH CHECK ADD FOREIGN KEY([PROJECT_ID])
REFERENCES [dbo].[PROJECT] ([PROJECT_ID])

ALTER TABLE [dbo].[ACCESS_RIGHT] WITH CHECK ADD FOREIGN KEY([ROLE_ID])
REFERENCES [dbo].[ROLE] ([ROLE_ID])

ALTER TABLE [dbo].[ACCESS_RIGHT] WITH CHECK ADD FOREIGN KEY([FEATURE_ID])
REFERENCES [dbo].[FEATURE] ([FEATURE_ID])

ALTER TABLE [dbo].[ACCESS_RIGHT] ADD  DEFAULT (getdate()) FOR [CREATE_TIME]

ALTER TABLE [dbo].[ACCESS_RIGHT] ADD  DEFAULT (getdate()) FOR [LAST_UPDATE_TIME]