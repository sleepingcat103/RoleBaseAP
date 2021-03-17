INSERT INTO "ChatBotService"."dbo"."ANSWER_PACKAGE" ("ANSWER_ID", "INFORMATION", "DETAIL", "ANS_NAME") VALUES (N'Sys_04_01_04_01', N'{
    "output": {
        "answerID": "Sys_04_01_04_01",
        "style" : "3",
        "generic": [{
            "response_type": "text",
            "text": "處理步驟如下：<br>1.請先確認系統畫面右上方的system顯示：HQAS4U01為測試環境，HQAS4P01為正式環境。"
        },
        {
                "title": "",
                "source": " /img/as400登入環境不正確.png",
                "response_type": "image"
        },
        {
            "response_type": "text",
            "text": "2.請關掉AS400視窗，重新開啟並輸入帳號密碼，留意密碼的大小寫，第一碼為大寫。若仍輸錯帳號密碼系統將會鎖定。 "
        }]
    }
}', N'AS400/EP400 / 帳號密碼 / 1120 / 登入的使用環境不正確', N'AS400/EP400 / 帳號密碼 / 1120 / 登入的使用環境不正確');
INSERT INTO "ChatBotService"."dbo"."ANSWER_PACKAGE" ("ANSWER_ID", "INFORMATION", "DETAIL", "ANS_NAME") VALUES (N'Sys_04_01_05', N'{
    "output": {
        "answerID": "Sys_04_01_05",
        "style" : "3",
        "generic": [{
            "response_type": "text",
            "text": "請確認您的帳號是否已有在別台電腦登入，或有不正常斷線退出狀況。<br>若已在別台電腦登入，請將別台電腦上的作業結束並登出，或等候30分鐘自動登出。<br>若有不正常斷線退出狀況，請聯絡業務支援室協助處理。"
        },
        {
            "response_type": "option",
            "title": "",
            "DETAIL": "",
            "options": [{
                "label": "授權申請單",
                "value": {
                    "input": {
                        "type": "download",
                        "text": "授權申請單下載",
                        "value": "/data/授權申請單.pdf"
                    }
                }
            }]
        }]
    }
}', N'AS400/EP400 / 帳號密碼 / 1220', N'AS400/EP400 / 帳號密碼 / 1220');
INSERT INTO "ChatBotService"."dbo"."ANSWER_PACKAGE" ("ANSWER_ID", "INFORMATION", "DETAIL", "ANS_NAME") VALUES (N'Sys_04_02', N"ChatBotService"."dbo"."ANSWER_PACKAGE" SET "INFORMATION"=N'{
    "output": {
        "answerID": "Sys_04_02",
        "style" : "3",
        "generic": [{
            "response_type": "text",
            "text": "新進人員請填寫授權申請單，交部門主管簽名後，傳送至業務支援室申請。"
        },    
        {
            "response_type": "option",
            "title": "",
            "DETAIL": "",
            "options": [{
                "label": "授權申請單",
                "value": {
                    "input": {
                        "type": "download",
                        "text": "授權申請單下載",
                        "value": "/data/授權申請單.pdf"
                    }
                }
            }]
        }]
    }
}', N'AS400/EP400:新人建立帳戶', N'AS400/EP400:新人建立帳戶');

