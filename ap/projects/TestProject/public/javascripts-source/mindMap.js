var mindMapController = (function() {
    
    let haveInit;
    let $tab = $('[tab="mindMap"]');
    let $search = $('#search');
    let $editSidebar = $tab.find('#editSidebar');
    let $searchSidebar = $tab.find('#searchSidebar');
    let jm;
    let nodes;
    
    // 初始化頁面動作
    function __init__() {

        $editSidebar.find('#addReturn').on('click', e => {
            $('[name="nodeReturn"]').append(`
            <div class="input-group" data-role="return-line">
                <input type="text" class="form-control">
                <div class="input-group-append">
                    <button class="btn btn-outline-primary" type="button" action="edit"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-outline-info" type="button" action="preview"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-outline-danger" type="button" data-remove="return-line"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>`)
        })

        $editSidebar.on('click', '[action="update"]', e => {
            let $target = $(e.currentTarget);
            let nodeId = $editSidebar.attr('nodeId');
            let type = $editSidebar.find('[name="nodeType"]').html();
            
            let newNode = {
                newTitle: $editSidebar.find('[name="nodeTitle"]').val() || null,
                newConditions: $editSidebar.find('[name="conditions"]').val() || null,
            }

            if(type != 'folder') {
                newNode = Object.assign(newNode, {
                    newOutput: {
                        generic: [{
                            response_type: 'text',
                            values: $editSidebar.find('[name="nodeReturn"] input').toArray().map(input => {
                                return {
                                    text: $(input).val() || ''
                                }
                            }),
                            selection_policy: $editSidebar.find('[name="chooseType"]').val()
                        }]
                    }
                })
            }
            
            
            $target.attr('disabled', true);
            mainController.getAssistantConfig()
            .then(response => {
                let body = Object.assign(response, {
                    dialogNode: nodeId,
                    newNode
                })
                
                return callBackendAPI('/watson/assistant/updateDialogNode', 'POST', body);
            })
            .then(response => {
                notify.success('編輯成功');
            })
            .catch(error => {
                notify.danger('編輯失敗' + error);
            })
            .finally(() => {
                $target.attr('disabled', false);
            })
        })

        $editSidebar.on('click', '[action="preview"]', e => {
            let $target = $(e.currentTarget);
            let ansId = $target.closest('.input-group').find('input').val();
            if(!ansId) return;

            
            let body = {
                projectId: mainController.getProjectId(),
                ansId: ansId
            }

            $target.attr('disabled', true);
            callBackendAPI('/getAnswerpack', 'POST', body)
            .then(response => {
                if(!response) {
                    notify.danger('沒有該答案包');
                } else {
                    let { output } = JSON.parse(response.INFORMATION);
                    mainController.preview(output);
                }
            })
            .catch(error => {
                notify.danger('取得答案包資料失敗');
            })
            .finally(() => {
                $target.attr('disabled', false);
            })
        })

        $editSidebar.on('click', '[action="edit"]', e => {
            if(confirm('確定要跳至編輯頁嗎?')) {
                let ansId = $(e.currentTarget).closest('.input-group').find('input').val();
                let projectId = mainController.getProjectId();
                mainController.newPage(`/${ projectId }/answerPack?ansId=${ ansId }`);
            }
        })

        $search.on('click', e => {
            $searchSidebar.toggleClass('active');
        })

        $searchSidebar.on('click', '[action="search"]', e => {
            let $target = $(e.currentTarget);
            let searchContent = $searchSidebar.find('#searchContent').val();

            let searchDialogIdResult = nodes.filter(node => {
                return node.dialog_node.indexOf(searchContent) > -1;
            }).map(node => {
                return {
                    id: node.dialog_node,
                    title: node.dialog_node
                }
            });

            let searchAnsIdResult = nodes.filter(node => {
                return node.hasOwnProperty('output') 
                    && node.output.generic.length > 0
                    && node.output.generic[0].values.length > 0;
            }).filter(node => {
                return node.output.generic[0].values[0].text.indexOf(searchContent) > -1;
            }).map(node => {
                return {
                    id: node.dialog_node,
                    title: node.output.generic[0].values[0].text
                }
            });

            // call api
            let searchContentResult; 

            let body = {
                projectId: mainController.getProjectId(),
                pattern: searchContent
            }

            $target.attr('disabled', true);
            callBackendAPI('/findAnswerpack', 'POST', body)
            .then(response => {
                searchContentResult = nodes.filter(node => {
                    return response.find(answerpack => {
                        return node.hasOwnProperty('output') 
                        && node.output.generic.length > 0
                        && node.output.generic[0].values.length > 0
                        && node.output.generic[0].values[0].text == answerpack.ANSWER_ID;
                    })
                }).map(node => {
                    return {
                        id: node.dialog_node,
                        title: node.output.generic[0].values[0].text
                    }
                });
            })
            .catch(error => {
                console.error(error);
            })
            .finally(() => {
                $target.attr('disabled', false);
                // console.log(searchDialogIdResult, searchAnsIdResult, searchContentResult);

                let myhtml = `
                    <h4 class="mt-2">搜尋dialog Id</h4>
                    <div>${ searchDialogIdResult.map(r => {
                        return `
                            <div action="gotoNode" class="btn btn-sm btn-light border mb-2" dialogNode="${ r.id }">
                                ${ r.title }
                            </div>`;
                    }).join('') || '無結果' }</div>
                    <h4 class="mt-2">搜尋答案包ID</h4>
                    <div>${ searchAnsIdResult.map(r => {
                        return `
                            <div action="gotoNode" class="btn btn-sm btn-light border mb-2" dialogNode="${ r.id }">
                                ${ r.title }
                            </div>`;
                    }).join('') || '無結果' }</div>
                    <h4 class="mt-2">搜尋答案包內容</h4>
                    <div>${ searchContentResult.map(r => {
                        return `
                            <div action="gotoNode" class="btn btn-sm btn-light border mb-2" dialogNode="${ r.id }">
                                ${ r.title }
                            </div>`;
                    }).join('') || '無結果' }</div>`

                $searchSidebar.find('div[content="searchReault"]').html(myhtml)
            })


        })
        $searchSidebar.on('click', '[action="gotoNode"]', e => {
            let dialogNode = $(e.currentTarget).attr('dialogNode');

            $searchSidebar.toggleClass('active');
            let node = jm.get_node(dialogNode);
            let parent = node.parent;

            while(parent) {
                jm.expand_node(parent);
                parent = parent.parent;
            }
            
            jm.select_node(dialogNode);
        })
        

        initPage();
        return 'ok';
    }

    // 初始化頁面資訊
    function initPage() {
        // get data
        let maskId = stableMask('心智圖載入中請稍後');

        mainController.getAssistantConfig()
        .then(response => {
            return callBackendAPI('/watson/assistant/listDialogNodes', 'POST', response)
        })
        .then(response => {
            nodes = response.result.dialog_nodes;
            let tree = {
                id: 'root',
                topic: '心智圖',
                item: null,
                after: null,
                parent: null,
                children: {}
            };

            console.log(nodes)
            tree = nodes.getChildren(tree);

            load_jsmind(tree);

            notify.success('心智圖載入成功');
        })
        .catch(error => {
            console.error(error)
            notify.danger('心智圖載入失敗，專案資訊未填寫');
        })
        .finally(() => {
            removeMask(maskId);
        })
        haveInit = true;
    }

    // private functions
    // 將assistant節點資料建成tree
    Array.prototype.getChildren = function(parentNode) {
        var childs = this.filter(item => {
            return parentNode.id == (item.parent || 'root');
        });

        let _this = this;
        if(childs.length > 0) {
            parentNode.children = childs.map(item => {
                return {
                    id: item.dialog_node,
                    item: item,
                    topic: item.title || item.conditions || item.dialog_node,
                    expanded: false,
                    after: item.previous_sibling || null,
                    parent: item.parent || 'root'
                };
            }).sortChildren();

            parentNode.children.map(item => {
                item = _this.getChildren(item);
            });
        }
        return parentNode;
    }

    // 排序子節點
    Array.prototype.sortChildren = function() {
        let result = [];
        for(var i=0;i<this.length; i++) {
            result.push(i==0 ? this.find(item => { return item.after == null }) : this.find(item => { return item.after == result[i - 1].id; }));
        }
        return result;
    }

    // 暫時用不到 顯示用
    function showTree(tree, floor) {
        floor = floor || 0;
        return !tree.hasOwnProperty('children') ? '' : tree.children.sortChildren().map(item => {
            return `\n  ${'  '.repeat(floor)} ${item.id} (${item.topic}) ${(item.hasOwnProperty('children') ? showTree(item, floor+1) : '')}`;
        }).join('');
    }

    // 用tree畫心智圖
    function load_jsmind(tree) {
        let mind = {
            "meta": {
                "name":"Assistant",
                "author":"",
                "version":"",
            },
            "format":"node_tree",
            "data": tree
        };
        let options = {
            container:'jsmind_container',
            editable: true,
            theme:'primary',
            shortcut: { enable: false },
            dblclick_handle: dblclick_handler
        }
        jm = jsMind.show(options, mind);
    }

    function dblclick_handler(e) {
        let element = e.target || event.srcElement;
        // this = jsmind
        let nodeId = this.view.get_binded_nodeid(element);
        if(!nodeId) return;

        let mindNode = this.get_node(nodeId);
        let WatsonNode = mindNode.data.item;
        // console.log(mindNode, WatsonNode);

        let maskId = stableMask('loading<span class="loading"></span>');

        mainController.getAssistantConfig()
        .then(response => {
            let body = Object.assign(response, { nodeId: WatsonNode.dialog_node });
            
            return callBackendAPI('/watson/assistant/getDialogNode', 'POST', body)
        })
        .then(response => {
            let node = response.result;
            let returns, returnType, chooseType;

            try {
                chooseType = node.output.generic[0].selection_policy;
                returnType = node.output.generic[0].response_type;
                returns = node.output.generic[0].values.map(value => value.text);
            } catch(e) {
                returns = [];
            }

            if(node.type == 'folder') {
                $editSidebar.find('#nodeReturn').hide();
                $editSidebar.find('#chooseType').hide();
            }else{
                if(returnType != 'text') {
                    notify.danger('節點內容無法解析，目前僅支援文字類型的回覆');
                    return;
                }
                $editSidebar.find('#nodeReturn').show();
                $editSidebar.find('#chooseType').show();
            }
            
            $editSidebar.attr('nodeId', nodeId);
            $editSidebar.find('[name="nodeType"]').html(node.type || '');
            $editSidebar.find('[name="nodeTitle"]').val(node.title || '');
            $editSidebar.find('[name="conditions"]').val(node.conditions || '');
            $editSidebar.find('[name="chooseType"]').val(chooseType || '');
            $editSidebar.find('[name="nodeReturn"]').html(returns.map(ret => {
                return `
                    <div class="input-group" data-role="return-line">
                        <input type="text" class="form-control" value="${ ret }" disabled>
                        <div class="input-group-append">
                            <button class="btn btn-outline-primary" type="button" action="edit"><i class="fas fa-pen"></i></button>
                            <button class="btn btn-outline-info" type="button" action="preview"><i class="fas fa-eye"></i></button>
                            <!-- <button class="btn btn-outline-danger" type="button" data-remove="return-line"><i class="fas fa-trash-alt"></i></button> -->
                        </div>
                    </div>`;
            }).join('') || '');

            $editSidebar.toggleClass('active');
        })
        .catch(error => {
            console.error (error);
        })
        .finally(() => {
            removeMask(maskId);
        })
    }


    // do page init
    __init__();

    return {
        haveInit,

        initPage,

        jm: () => {
            return jm
        }
    }

})();