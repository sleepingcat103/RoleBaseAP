var reportController = (function() {
    
    let haveInit;
    let $tab = $('[tab="report"]');
    let $startDt = $('#startDt');
    let $endDt = $('#endDt');

    let $search = $tab.find('[action="search"]');
    let $download = $tab.find('[action="download"]');

    let datatableConfig = {
        dom: `<"d-flex justify-content-between align-items-center" f
                <"d-flex align-items-center" 
                    <i>
                    <"ml-2" l>
                    <"ml-2" p>
                >>t<"d-flex justify-content-end"p>`,
        responsive: true,
        language: {
            url: "/backend/static/plugin/datatable-traditional-chonese.json"
        }
    };
    
    // 初始化頁面動作
    function __init__() {
        // datatable
        interactions.datatable = interactions.$.DataTable(datatableConfig);
        chats.datatable = chats.$.DataTable(datatableConfig);
        questionRank.datatable = questionRank.$.DataTable(datatableConfig);
        answerRank.datatable = answerRank.$.DataTable(datatableConfig);

        // 篩選信心功能
        $(chats.datatable.table().container()).on('click focus', '#chatsFilterIntent', e => {
            console.log(e);
            e.preventDefault();
        })

        // 日期區間初始化
        $tab.find('[input-content="datepicker"]').datepicker({
            format: "yyyy/mm/dd",
            autoclose: true,
            calendarWeeks: true,
            todayHighlight: true,
            language: 'zh-TW'
        });
        $startDt.val(dayjs().add(-1, 'day').format('YYYY/MM/DD'));
        $endDt.val(dayjs().format('YYYY/MM/DD'));

        // 快速選擇區間
        $tab.find('#range_Mondh').on('click', e => {
            $startDt.val(dayjs().add(-1, 'month').format('YYYY/MM/DD'));
            $endDt.val(dayjs().format('YYYY/MM/DD'));
        })
        $tab.find('#range_Week').on('click', e => {
            $startDt.val(dayjs().add(-7, 'day').format('YYYY/MM/DD'));
            $endDt.val(dayjs().format('YYYY/MM/DD'));
        })
        $tab.find('#range_Day').on('click', e => {
            $startDt.val(dayjs().add(-1, 'day').format('YYYY/MM/DD'));
            $endDt.val(dayjs().format('YYYY/MM/DD'));
        })

        // 搜尋按鈕
        $search.on('click', e => {
            let $target = $(e.currentTarget);

            let no = $tab.find('#myTab a.active').attr('no');
            
            let handler = [interactions, chats, questionRank, answerRank][no];
            
            let body = handler.getBody();
            if(!body) return;

            $target.attr('disabled', true);

            handler.datatable.clear().draw();
            handler.doSearch(body)
            .then(() => { notify.success('搜尋成功'); })
            .catch(error => { console.error(error); notify.danger('搜尋失敗'); })
            .finally(() => { $target.attr('disabled', false); })
        })
        // 下載按鈕
        $download.on('click', e => {
            let no = $tab.find('#myTab a.active').attr('no');
            let handler = [interactions, chats, questionRank, answerRank][no];

            let header = $(handler.datatable.table().header()).find('th').toArray().map(th => $(th).text());
            let content = handler.datatable.rows().data().toArray();

            DownloadGreatArray([header].concat(content), handler.name);

            // let header = handler.datatable.columns().header().toArray().map(th => $(th).text())
            // let data = [header].concat(handler.datatable.rows().data().toArray());
            // let sheet = XLSX.utils.aoa_to_sheet(data);
            // openDownloadDialog(sheet2blob(sheet), handler.name + '.xlsx');
        })

        initPage();
        return 'ok'
    }

    // 初始化頁面資訊
    function initPage() {
        // get data

        haveInit = true;
    }

    // private functions
    function findSetLog(body) {
        return callBackendAPI('/findSetLog', 'POST', body);
    }
    let interactions = {
        $: $tab.find('#interactions'),
        name: '互動總表',
        getBody: () => {

            // 防呆
            let startDt = $startDt.val(),
                endDt = $endDt.val();

            if(!startDt || !endDt) {
                notify.danger('請填寫起迄日');
                return false;
            }

            endDt = dayjs(endDt).add(1, 'day').format('YYYY/MM/DD');
            if(startDt > endDt) {
                notify.danger('起日需早於迄日');
                return false;
            }

            let body = {
                projectId: mainController.getProjectId(),
                startDt: startDt,
                endDt: endDt,
                offset: 0
            }

            return body;
        },
        doSearch: (body) => {
            let searchHandler = (response) => {
                interactions.datatable.rows.add(response.map(row => {
                    let { CREATE_TIME, SESSION_ID, USER_TYPE, USER_SAY, INTENT, INTENT_CONFIDENCE, ENTITY, ANSWER_ID, ANS_NAME, DETAIL } = row;
                    return [
                        localeTimeTW(CREATE_TIME),
                        SESSION_ID,
                        USER_TYPE,
                        htmlEncode(USER_SAY),
                        INTENT,
                        INTENT_CONFIDENCE || 0,
                        ENTITY,
                        ANSWER_ID,
                        ANS_NAME,
                        DETAIL
                    ];
                })).draw();
            }

            return mainController.rollingSearch(body, findSetLog, searchHandler)
            .catch(error => { console.error(error); });
        }
    }
    let chats = {
        $: $tab.find('#chats'),
        name: '自然發話',
        getBody: () => {

            // 防呆
            let startDt = $startDt.val(),
                endDt = $endDt.val();

            if(!startDt || !endDt) {
                notify.danger('請填寫起迄日');
                return false;
            }

            endDt = dayjs(endDt).add(1, 'day').format('YYYY/MM/DD');
            if(startDt > endDt) {
                notify.danger('起日需早於迄日');
                return false;
            }

            let body = {
                projectId: mainController.getProjectId(),
                startDt: startDt,
                endDt: endDt,
                action: 'text',
                offset: 0
            }

            return body;
        },
        doSearch: (body) => {
            let searchHandler = (response) => {
                chats.datatable.rows.add(response.map(row => {
                    let { CREATE_TIME, SESSION_ID, USER_SAY, INTENT, INTENT_CONFIDENCE, ENTITY, ANSWER_ID, ANS_NAME, DETAIL } = row;
                    return [
                        localeTimeTW(CREATE_TIME),
                        SESSION_ID,
                        htmlEncode(USER_SAY),
                        INTENT,
                        INTENT_CONFIDENCE,
                        ENTITY,
                        ANSWER_ID,
                        ANS_NAME,
                        DETAIL
                    ];
                })).draw();
            };

            return mainController.rollingSearch(body, findSetLog, searchHandler)
            .catch(error => { console.error(error); });
        }
    }
    let questionRank = {
        $: $tab.find('#questionRank'),
        name: '詢問排行',
        getBody: () => {

            // 防呆
            let startDt = $startDt.val(),
                endDt = $endDt.val();

            if(!startDt || !endDt) {
                notify.danger('請填寫起迄日');
                return false;
            }

            endDt = dayjs(endDt).add(1, 'day').format('YYYY/MM/DD');
            if(startDt > endDt) {
                notify.danger('起日需早於迄日');
                return false;
            }

            let body = {
                projectId: mainController.getProjectId(),
                startDt: startDt,
                endDt: endDt,
                offset: 0
            }

            return body;
        },
        doSearch: (body) => {
            let searchHandler = (response) => {
                let sortedData = []
                response.filter(row => {
                    return row.USER_SAY.trim();
                }).forEach(row => {
                    let { USER_TYPE, USER_SAY, INTENT, INTENT_CONFIDENCE } = row;

                    let target = sortedData.find(obj => obj.text == USER_SAY);
                    if(!target) {
                        sortedData.push({
                            text: USER_SAY,
                            action: {
                                button: USER_TYPE == 'buttons' ? 1 : 0,
                                text: USER_TYPE == 'text' ? 1 : 0
                            },
                            intent: INTENT,
                            confidences: [INTENT_CONFIDENCE]
                        })
                    } else {
                        target.action[USER_TYPE] ++;
                        target.confidences.push(INTENT_CONFIDENCE)
                    }
                })
                
                let rows = sortedData.sort((a, b) => {
                    let A = a.action.button + a.action.text;
                    let B = b.action.button + b.action.text;
                    
                    return A > b ? -1 : A < B ? -1 : 0;
                }).map((row, index) => {
                    let confidences = row.confidences.filter(c => c > 0);
                    console.log('confidences', confidences)
                    let averageConfidence = confidences.length == 0 ? 0 : (confidences.reduce((a, b) => a + b, 0) || 0) / confidences.length;

                    return [ index+1, htmlEncode(row.text), row.intent, averageConfidence, row.action.button, row.action.text ]
                })
                
                questionRank.datatable.rows.add(rows).draw();
            }
            
            return mainController.rollingSearch(body, findSetLog, searchHandler)
            .catch(error => { console.error(error); });
        }
    }
    let answerRank = {
        $: $tab.find('#answerRank'),
        name: '回答排行',
        getBody: () => {

            // 防呆
            let startDt = $startDt.val(),
                endDt = $endDt.val();

            if(!startDt || !endDt) {
                notify.danger('請填寫起迄日');
                return false;
            }

            endDt = dayjs(endDt).add(1, 'day').format('YYYY/MM/DD');
            if(startDt > endDt) {
                notify.danger('起日需早於迄日');
                return false;
            }

            let body = {
                projectId: mainController.getProjectId(),
                startDt: startDt,
                endDt: endDt,
                offset: 0
            }

            return body;
        },
        doSearch: (body) => {
            let searchHandler = (response) => {
                
                let sortedData = {}
                response.forEach(row => {
                    let { ANSWER_ID, ANS_NAME, DETAIL } = row;

                    let target = sortedData.hasOwnProperty(ANSWER_ID);
                    if(!target) {
                        sortedData[ANSWER_ID] = {
                            ansId: ANSWER_ID,
                            count: 1,
                            ansName: ANS_NAME,
                            datail: DETAIL
                        }
                    } else {
                        sortedData[ANSWER_ID].count ++;
                    }
                })
                
                let rows = Object.values(sortedData).sort((a, b) => {
                    let A = a.count;
                    let B = b.count;
                    
                    return A > b ? -1 : A < B ? -1 : 0;
                }).map((row, index) => {
                    return [ index+1, row.ansId, row.count, row.ansName, row.datail ]
                })
                
                answerRank.datatable.rows.add(rows).draw();
            }

            return mainController.rollingSearch(body, findSetLog, searchHandler)
            .catch(error => { console.error(error); });
        }
    }

    // do page init
    __init__();

    return {
        haveInit,

        initPage,
    }

})();
