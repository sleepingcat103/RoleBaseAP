let express = require('express');
let router = express.Router();

let BackendService = require('../../controller/BackendController');

// watson Assistant
router.post('/updateWorkspace', BackendService.updateWorkspace);

router.post('/listDialogNodes', BackendService.listDialogNodes);
router.post('/getDialogNode', BackendService.getDialogNode);
router.post('/updateDialogNode', BackendService.updateDialogNode);

router.post('/listIntents', BackendService.listIntents);
router.post('/createIntent', BackendService.createIntent);
router.post('/updateIntent', BackendService.updateIntent);
router.post('/deleteIntent', BackendService.deleteIntent);

router.post('/listExamples', BackendService.listExamples);
router.post('/deleteExample', BackendService.deleteExample);
router.post('/updateExample', BackendService.updateExample);
router.post('/createExample', BackendService.createExample);

router.post('/listEntities', BackendService.listEntities);
router.post('/getEntity', BackendService.getEntity);
router.post('/createEntity', BackendService.createEntity);
router.post('/deleteEntity', BackendService.deleteEntity);
router.post('/updateEntity', BackendService.updateEntity);

router.post('/deleteValue', BackendService.deleteValue);
router.post('/createValue', BackendService.createValue);
router.post('/updateValue', BackendService.updateValue);

router.post('/listSynonyms', BackendService.listSynonyms);

router.post('/listCounterexamples', BackendService.listCounterexamples);

module.exports = router;
