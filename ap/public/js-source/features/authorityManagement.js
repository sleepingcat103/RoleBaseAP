
var authorityManagementController = (function() {
    
    let haveInit;
    let authorities, roles;

    let $tab = $('[tab="authorityManagement"]');
    let $table = $tab.find('table');
    let $editAuthority = $tab.find('#editAuthority');
    let $insertAuthority = $tab.find('#insertAuthority');
    
    // 初始化頁面動作
    function __init__() {

        let $editSidebar = sidebar($editAuthority, '', true);
        $editSidebar.on('click', 'button[action="update"]', updateAuthority);
        $editSidebar.on('click', 'button[action="cancel"]', cancelEditAuthority);
        $editSidebar.on('click', 'button[action="delete"]', deleteAuthority);

        let $insertSidebar = sidebar($insertAuthority, '', true);
        $insertSidebar.on('click', 'button[action="insert"]', insertAuthority);
        $insertSidebar.on('click', 'button[action="cancel"]', cancelInsertAuthority);

        // 編輯權限
        $table.on('click', 'button', function(e) {
            let userId = $(e.currentTarget).attr('userId');;
            let authority = authorities.find(au => au.USER_ID === userId);

            $editAuthority.find('#user_id').val(authority.USER_ID);
            $editAuthority.find('#user_role').val(authority.ROLE_ID);
            $editAuthority.find('#user_active').attr('checked', authority.ACTIVE === 1);
            $editAuthority.find('#user_memo').val(authority.MEMO);

            $editSidebar.toggleClass('active');
        });

        // 新增權限
        $tab.on('click', '#add_authority', function(e) {
            $insertSidebar.toggleClass('active');
        });
        
        function insertAuthority() {
            let body = { 
                userId: $insertSidebar.find('#user_id').val(), 
                projectId: mainController.getProjectId(), 
                roleId: $insertSidebar.find('#user_role').val(), 
                active: $insertSidebar.find('#user_active:checked').length, 
                memo: $insertSidebar.find('#user_memo').val(),
            }

            let $insertButton = $insertSidebar.find('button[action="insert"]');
            let $alert = $insertSidebar.find('#user_alert');
            $insertButton.attr('disabled', true);
            $alert.hide();

            callBackendAPI('/insertAuthority', 'POST', body)
            .then(response => {
                console.log(response);

                $insertSidebar.find('#user_id').val('');
                $insertSidebar.find('#user_role').val('');
                $insertSidebar.find('#user_active:checked').trigger('click');
                $insertSidebar.find('#user_memo').val('');

                $insertSidebar.toggleClass('active');
                
                authorities.push(response);
                insertRow(response);
            })
            .catch(error => {
                $alert.html(error.msg);
                $alert.show();
            })
            .finally(() => {
                $insertButton.attr('disabled', false);
            })
        };
        function updateAuthority() {
            let confirmMsg = '確認編輯？';

            if(confirm(confirmMsg)) {
                let userId = $editSidebar.find('#user_id').val();
                let $updateButton = $editSidebar.find('button[action="update"]');
                let $alert = $editSidebar.find('#user_alert');
                let targetAuthority = authorities.find(authority => authority.USER_ID == userId );

                if(!targetAuthority) {
                    $alert.html('資訊錯誤，不存在的使用者');
                    $alert.show();
                    return;
                } 

                let body = { 
                    userId: userId, 
                    projectId: mainController.getProjectId(), 
                    roleId: $editSidebar.find('#user_role').val(),
                    active: $editSidebar.find('#user_active:checked').length, 
                    memo: $editSidebar.find('#user_memo').val(),
                }
    
                $updateButton.attr('disabled', true);
                $alert.hide();
    
                callBackendAPI('/updateAuthority', 'POST', body)
                .then(response => {
                    updateRow(response);
                    $editSidebar.toggleClass('active');
                })
                .catch(error => {
                    $alert.html(error.msg);
                    $alert.show();
                })
                .finally(() => {
                    $updateButton.attr('disabled', false);
                })
            }
        };
        function cancelEditAuthority() {
            $editSidebar.toggleClass('active');
        };
        function cancelInsertAuthority() {
            $insertSidebar.toggleClass('active');
        }
        function deleteAuthority() {
            let confirmMsg = '將刪除授權，是否確認？';

            if(confirm(confirmMsg)) {
                let userId = $editSidebar.find('#user_id').val();
                let $deleteButton = $editSidebar.find('button[action="delete"]');
                let $alert = $editSidebar.find('#user_alert');
                let targetIndex = authorities.findIndex(authority => authority.USER_ID == userId );

                if(targetIndex < 0) {
                    $alert.html('資訊錯誤，不存在的使用者');
                    $alert.show();
                    return;
                } 

                let body = { 
                    userId: userId, 
                    projectId: mainController.getProjectId(), 
                    roleId: $editSidebar.find('#user_role').val(),
                }
    
                $deleteButton.attr('disabled', true);
                $alert.hide();
    
                callBackendAPI('/deleteAuthority', 'POST', body)
                .then(response => {
                    authorities.splice(targetIndex, 1);

                    deleteRow(userId);
                    $editSidebar.toggleClass('active');
                })
                .catch(error => {
                    $alert.html(error.msg);
                    $alert.show();
                })
                .finally(() => {
                    $deleteButton.attr('disabled', false);
                })
            }
        };

        initPage();
        return 'ok';
    }

    // 初始化頁面資訊
    function initPage() {
        // get data
        // 取得所有身分組與使用者列表
        let requests = (() => {
            let body = {
                projectId: mainController.getProjectId()
            }

            return [
                callBackendAPI('/listUsersByProjectId', 'POST', body),
                callBackendAPI('/listRole', 'GET', {})
            ]
        })();

        Promise.all(requests)
        .then(response => {
            authorities = response[0];
            roles = response[1];

            let tableRows = authorities.map(function(authority) {
                authority.ROLE_NAME = (roles.find(role => role.ROLE_ID === authority.ROLE_ID) || {}).ROLE_NAME;
                return generateRow(authority);
            }).join('');

            $table.find('tbody').html(tableRows);
            $editAuthority.find('#user_role').html(generateRoleOptions(roles));
            $insertAuthority.find('#user_role').html(generateRoleOptions(roles));

            haveInit = true;
        })
        .catch(error => {            
            tempMask('頁面初始化失敗，請洽開發人員');
            console.log('頁面初始化失敗，請洽開發人員');
            console.error(error);
        })

    }

    // private functions
    function generateRow(authority) {
        return `
        <tr userId=${ authority.USER_ID }>
            <td>${ authority.USER_ID }</td>
            <td>${ authority.ACTIVE == 1 ? '<div class="badge badge-info">啟用</div>' : '<div class="badge badge-secondary">停用</div>' }</td>
            <td>${ getRoleNameById(authority.ROLE_ID) }</td>
            <td>${ authority.MEMO || '-' }</td>
            <td><button type="button" class="btn btn-success btn-sm" userId="${ authority.USER_ID }">編輯</button></td>
        </tr>`;
    }
    function getRow(userId) {
        return $table.find(`[userId="${ userId }"]`);
    }
    function updateRow(authority) {
        let $targetRow = getRow(authority.USER_ID);
        $targetRow.after(generateRow(authority));
        $targetRow.remove();
    }
    function insertRow(authority) {
        // console.log(authority);
        $table.find('tbody').append(generateRow(authority))
    }
    function deleteRow(userId) {
        let $targetRow = getRow(userId);
        $targetRow.remove();
    }
    function generateRoleOptions(roles) {
        return roles.map(function(role) {
            return '<option value="' + role.ROLE_ID + '">' + role.ROLE_NAME + '</option>';
        }).join('\n');
    }
    function getRoleNameById(roleId) {
        return (roles.find((role) => role.ROLE_ID == roleId) || {}).ROLE_NAME;
    }

    // do page init
    __init__();

    return { }

})();
