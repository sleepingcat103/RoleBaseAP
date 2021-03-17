var userCommentController = (function() {
    
    let haveInit;
    let $tab = $('[tab="userComment"]');
    let $startDt = $('#startDt');
    let $endDt = $('#endDt');
    let $sessionId = $('#sessionId');
    let userCommentDatatable;

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

        userCommentDatatable = $tab.find('table').DataTable(datatableConfig);
        
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
        
        $search.on('click', e => {
            let $target = $(e.currentTarget);

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
                sessionId: $sessionId.val(),
                offset: 0
            }
            let findSurvey = (body) => { return callBackendAPI('/findSurvey', 'POST', body); }
            
            let searchHandler = (response) => {
                userCommentDatatable.rows.add(response.map(row => {
                    let { CREATE_TIME, SATISFACTION, SESSIONID, COMMENTS, COME_FROM } = row;
                    return [
                        localeTimeTW(CREATE_TIME),
                        SATISFACTION,
                        htmlEncode (COMMENTS),
                        COME_FROM,
                        SESSIONID,
                    ];
                })).draw();
            };
    
            $target.attr('disabled', true);
            userCommentDatatable.clear().draw();

            return mainController.rollingSearch(body, findSurvey, searchHandler)
            .then(() => { notify.success('搜尋成功'); })
            .catch(error => { console.error(error); notify.danger('搜尋失敗'); })
            .finally(() => { $target.attr('disabled', false); })
        })
        // 下載按鈕
        $download.on('click', e => {
            DownloadGreatCSV($tab.find('table'), '意見回覆');

            // let header = userCommentDatatable.columns().header().toArray().map(th => $(th).text())
            // let data = [header].concat(userCommentDatatable.rows().data().toArray());
            // let sheet = XLSX.utils.aoa_to_sheet(data);
            // openDownloadDialog(sheet2blob(sheet), '意見回覆' + '.xlsx');
        })
        
        initPage();
        return 'ok';
    }

    // 初始化頁面資訊
    function initPage() {
        // get data

        haveInit = true;
    }

    // private functions


    // do page init
    __init__();

    return {
        haveInit,

        initPage,
    }

})();
