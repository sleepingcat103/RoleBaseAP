(function() {
    
    let haveInit;
    let $component = $('[component="role"]');
    let $roleContainer = $component.find('[content="roles"]');
    let $addRole = $component.find('#addRole');
    let $addRoleSidebar = $component.find('#addRoleSidebar');
    
    // 初始化頁面動作
    function __init__() {

        $addRole.on('click', e => {
            $addRoleSidebar.toggleClass('active')
        })
        $addRoleSidebar.on('click', '[action="create"]', e => {
            let $target = $(e.currentTarget);
            let roleId = $addRoleSidebar.find('#roleId').val();
            let roleName = $addRoleSidebar.find('#roleName').val();

            if(!roleId || !roleName) return;

            $addRoleSidebar.find('#role_alert').hide();
            $target.attr('disabled', true);

            let body = { roleId, roleName };
            callBackendAPI('/insertRole', 'POST', body)
            .then(response => {
                $roleContainer.prepend(buildRoleHtml(response));
                $addRoleSidebar.toggleClass('active');
                notify.success('新增成功!');
            })
            .catch(error => {
                $addRoleSidebar.find('#role_alert').html(error.msg).show();
                notify.danger('新增失敗!');
            })
            .finally(() => {
                $target.attr('disabled', false);
            })
        })
        $roleContainer.on('click', '[action="deleteRole"]', e => {

            if(!confirm('確定要刪除? 此動作無法復原')) return;

            let $target = $(e.currentTarget);
            let $block = $target.parent().parent().parent();
            let roleId = $target.parent().parent().attr('roleId');

            $target.attr('disabled', true);
            let body = { roleId };
            callBackendAPI('/deleteRole', 'POST', body)
            .then(response => {
                $block.remove();
                notify.success('刪除成功!');
            })
            .catch(error => {
                notify.danger('刪除失敗!');
            })
            .finally(() => {
                $target.attr('disabled', false);
            })
        })

        initPage();
        return 'ok';
    }

    // 初始化頁面資訊
    function initPage() {
        // get data
        callBackendAPI('/listRole', 'GET')
        .then(response => {
            let myHtml = response.map(role => {
                return buildRoleHtml(role);
            }).join('')
            $roleContainer.prepend(myHtml);
        })
        .catch(error => {

        })

        haveInit = true;
    }

    // private functions
    function buildRoleHtml(role) {
        return `
        <div class="col-xl-3 col-md-4 col-6 px-0">
            <div class="d-flex justify-content-between align-items-center border rounded px-2 py-2 mt-1 mr-1" roleId="${ role.ROLE_ID }">
                <span>${ role.ROLE_NAME }</span>
                <div>
                    <a action="deleteRole" href="#" class="badge badge-danger"><i class="fas fa-times"></i></a>
                </div>
            </div>
        </div>`;
    }

    // do page init
    __init__();

    return {
        haveInit,

        initPage,
    }

})();