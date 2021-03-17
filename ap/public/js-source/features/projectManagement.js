var projectManagementController = (function() {
    
    let haveInit;
    let $tab = $('[tab="projectManagement"]');
    let $roleBlock = $('[content="role"]');
    let $featureBlock = $('[content="feature"]');
    let $userBlock = $('[content="user"]');
    let $selectAllFeatures = $featureBlock.find('input[type=checkbox][name=feature-all]');
    
    // 初始化頁面動作
    function __init__() {

        $roleBlock.on('change', 'input[type=radio]', e => {
            let roleId = $(e.currentTarget).val();
            Promise.all([ getAccrssRights(roleId), getAuthoritites(roleId) ])
            .then(response => {
                let [ accessRights, authorities ] = response;

                $featureBlock.find(`input[type=checkbox][name=feature]`).prop("checked", false);
                accessRights.map(ar => {
                    // set .prop("checked", true) do not trigger 'change' event
                    $featureBlock.find(`input[type=checkbox][name=feature][value=${ ar.FEATURE_ID }]`).prop("checked", true);
                })
                if($featureBlock.find(`input[type=checkbox][name=feature]`).not(':checked').length > 0) {
                    $selectAllFeatures.prop('checked', false);
                } else {
                    $selectAllFeatures.prop('checked', true);
                }

                $userBlock.find('.main-block-body').html(
                    authorities.length > 0 ? `<ol>${ authorities.map(ar => {
                        return `<li class="mx-2 my-1">${ ar.USER_ID }</li>`;
                    }).join('\n') }</ol>` : '沒有成員'
                )
                
            })
            .catch(err => {

            })
        })

        // 全選
        $featureBlock.on('change', 'input[type=checkbox][name=feature-all]', e => {
            let $unchecked = $featureBlock.find('input[type=checkbox][name=feature]').not(':checked');
            let $checked = $featureBlock.find('input[type=checkbox][name=feature]:checked');

            if($unchecked.length > 0) {
                $unchecked.trigger('click');
                $selectAllFeatures.prop("checked", true);
            } else {
                $checked.trigger('click');
                $selectAllFeatures.prop("checked", false);
            }

        })

        // set .prop("checked", true) do not trigger 'change' event
        $featureBlock.on('change', 'input[type=checkbox][name=feature]', e => {
            let $target = $(e.currentTarget);
            let featureId = $target.val();
            let checked = $target.prop('checked');

            (() => {
                $target.attr('disabled', true);
                if(checked === true) {
                    return insertAccessRight(featureId);
                } else if (checked === false) {
                    return deleteAccessRight(featureId);
                }
            })()
            .then(response => {
                notify.success('Success!');
            })
            .catch(err => {
                $target.prop('checked', !checked);
            })
            .finally(() => {
                $target.attr('disabled', false);
                
                let $unchecked = $featureBlock.find('input[type=checkbox][name=feature]').not(':checked');
                if($unchecked.length > 0) {
                    $selectAllFeatures.prop("checked", false);
                } else {
                    $selectAllFeatures.prop("checked", true);
                }
            })
        })

        initPage();
        return 'ok';
    }

    // 初始化頁面資訊
    function initPage() {
        // get data
        Promise.all([ getRoles(), getFeatures() ])
        .then(responses => {
            let [ roles, features ] = responses
            $roleBlock.find('.main-block-body').html(
                roles.map(role => {
                    return `
                        <div class="mx-2 my-1">
                            <div class="pretty p-default p-curve p-smooth">
                                <input type="radio" name="role" value="${ role.ROLE_ID }" />
                                <div class="state p-primary-o">
                                    <label>${ role.ROLE_NAME }</label>
                                </div>
                            </div>
                        </div>`
                }
            ).join('\n'));

            $featureBlock.find('.main-block-body').html(
                features.map(feature => {
                    return `
                        <div class="mx-2 my-1">
                            <div class="pretty p-default p-curve p-smooth">
                                <input type="checkbox" name="feature" value="${ feature.FEATURE_ID }" />
                                <div class="state p-primary-o">
                                    <label>${ feature.FEATURE_NAME }</label>
                                </div>
                            </div>
                        </div>`;
                }
            ).join('\n'));

            $roleBlock.find('input:first').trigger('click');
        })
        .catch(error => {

        })

        haveInit = true;
    }

    // private functions
    function getRoles() {
        return callBackendAPI('/listRole', 'GET');
    }
    function getFeatures() {
        return callBackendAPI('/listFeature', 'GET');
    }
    function getAccrssRights(roleId) {
        let body = {
            roleId: roleId,
            projectId: mainController.getProjectId()
        }
        return callBackendAPI('/listAccessRight', 'POST', body);
    }
    function getAuthoritites(roleId) {
        let body = {
            roleId: roleId,
            projectId: mainController.getProjectId()
        }
        
        return callBackendAPI('/listAuthorityByProjectIdAndRoleId', 'POST', body);
    }
    function insertAccessRight(featureId) {
        let body = {
            roleId: $roleBlock.find('input:checked').val(),
            projectId: mainController.getProjectId(),
            featureId: featureId
        }
        return callBackendAPI('/insertAccessRight', 'POST', body)
    }
    function deleteAccessRight(featureId) {
        let body = {
            roleId: $roleBlock.find('input:checked').val(),
            projectId: mainController.getProjectId(),
            featureId: featureId
        }
        return callBackendAPI('/deleteAccessRight', 'POST', body)
    }

    // do page init
    __init__();

    return {
        haveInit,

        initPage,
    }

})();