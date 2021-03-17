
INSERT INTO [PROJECT] (PROJECT_ID, PROJECT_NAME, ACTIVE, MEMO) 
	VALUES ('TestProject', N'測試專案', '1', '');

INSERT INTO [ROLE] (ROLE_ID, ROLE_NAME, EDITABLE, MEMO) 
	VALUES ('teamMember', N'團隊成員', '1', '');

INSERT INTO [ACCESS_RIGHT] (PROJECT_ID, ROLE_ID, FEATURE_ID, ACCESS_LAYER) 
	VALUES ('TestProject', 'teamMember', 'mindMap', '');
    
INSERT INTO [AUTHORITY] (USER_ID, PROJECT_ID, ROLE_ID, ACTIVE) 
	VALUES ('test', 'TestProject', 'teamMember', '1');