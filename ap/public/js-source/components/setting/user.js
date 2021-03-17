(function() {
    
    let haveInit;
    let $component = $('[component="user"]');
    // let $userContainer = $component.find('[content="users"]');
    let datatable;
    
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

        datatable = $component.find('table').DataTable(datatableConfig);

        // $component.find('table').on('click', '[action="delete"]', e => {

        //     if(!confirm('確定要刪除? 此動作無法復原')) return;

        //     let $target = $(e.currentTarget);
        //     let $block = $target.parent().parent().parent();

        //     let body = {
        //         userId: $block.text().trim()
        //     }
        //     callBackendAPI('/deleteUser', 'POST', body)
        //     .then(response => {
        //         notify.success('刪除成功!');
        //         $block.remove();
        //     })
        //     .catch(error => {
        //         notify.danger('刪除失敗!');
        //     })
        // })
        
        $component.find('table').on('click', '[action="toggle"]', e => {
            let $target = $(e.currentTarget);

            let oriColorClass = mainController.getBgClassByActive($target.attr('active'));
            let oriActive = $target.attr('active');
            let newActive = (oriActive-0+1)%2;

            let body = {
                active: newActive,
                userId: $target.closest('tr').find('td').first().text().trim()
            }
            callBackendAPI('/toggleUser', 'POST', body)
            .then(response => {
                $target.attr('active', newActive)
                
                $target.html(generateActiveHtml(newActive));
                $target.removeClass(oriColorClass);
                $target.addClass(mainController.getBgClassByActive(newActive));
            })
            .catch(error => {
                
            })

        })
        $component.find('table').on('click', '[action="delete"]', e => {
            
            if(!confirm('確定要刪除? 此動作無法復原')) return;

            let $target = $(e.currentTarget);
            let $row = $target.closest('tr');

            let body = {
                userId: $row.find('td').first().text().trim()
            }
            callBackendAPI('/deleteUser', 'POST', body)
            .then(response => {
                datatable.row($row[0]).remove().draw();
                notify.success('刪除成功');
            })
            .catch(error => {
                notify.danger('刪除失敗');
            })
        })

        initPage();
        return 'ok';
    }

    // 初始化頁面資訊
    function initPage() {
        // get data
        callBackendAPI('/listUsers', 'GET')
        .then(response => {
            datatable.rows.add(response.map(user => {
                return generateRow(user);
            })).draw();
        })
        .catch(error => {

        })

        haveInit = true;
    }

    // private functions
    function generateRow(user) {
        return [
            user.USER_ID,
            generateButtonByActive(user.ACTIVE),
            localeTimeTW(user.CREATE_TIME),
            localeTimeTW(user.LAST_UPDATE_TIME),
            '<button action="delete" class="btn btn-sm btn-danger"><i class="fas fa-times mr-1"></i> 刪除</a>'
        ]
    }
    function generateButtonByActive(active) {
        return `<button action="toggle" class="btn-sm btn ${ mainController.getBgClassByActive(active) }" active="${ active }">
            ${ generateActiveHtml(active) }
        </a>`;
    }
    function generateActiveHtml(active) {
        return active == '1' ? '<i class="fas fa-check mr-1"></i> 啟用中' : 
                active == '0' ? '<i class="fas fa-ban mr-1"></i> 停用中' : '';
    }

    // do page init
    __init__();

    return {
        haveInit,

        initPage,
    }

})();