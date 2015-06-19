//! include /ui/ruleengine/js/fieldTree/reFieldMetaDAO.js
//! include /ui/ruleengine/js/fieldTree/reFunctionDAO.js
//! include /ui/ruleengine/js/common/reUtil.js
 
//local file
var LOG = juic.Logger.getLogger('FieldTree');
var META_DAO = new REFieldMetaDAO();
var FUNCTION_DAO = new REFunctionDAO();
var TYPES_WITH_CHILDREN = {
    ec : true,
    mdf : true,
    foundationObject : true,
    custom: true
};
 
function TreeObjectHandler(options){
                this._baseObjectId = options.baseobjectid;
                this._baseObjectType = options.baseobjecttype;
                this._noExpansion = false;
                this._allowDiscriminator = true;
                this._allowFunctions = true;
                this._functionOptions = null;
                this._fieldData = null;
}
 
TreeObjectHandler.prototype.setObjectIdAndType = function(objectId, objectType){
                this._baseObjectId = objectId;
                this._baseObjectType = objectType;
},
 
TreeObjectHandler.prototype.setFilter = function(fieldId, isBaseOnRuleParameter, callback) {
    var me = this;
    var callbackMeta = RE.createMBeanCallback(this, function(response){me._onDataAvailable(response); callback();}, this._handleError);
 
    META_DAO.getMetaData(this._baseObjectId, this._baseObjectType, this._leftObjectType, this._leftObjectId,
            callbackMeta);
};
 
TreeObjectHandler.prototype.getFieldData = function(){
    return this._fieldData;
}
 
TreeObjectHandler.prototype.updateFunctions = function(callbackFunc){
                var me = this;
 
                FUNCTION_DAO.getCompatibleFunctionDefinitions(null,'nil', undefined,
                                {'baseObjectId':this._baseObjectId,'baseObjectType':this._baseObjectType},
                                {
            callback : function(response) {
                me._handleFunctionDefinitions(response);
                callbackFunc();
            },
            errorHandler : function(message, error) {
                error && LOG.error('Error retrieving functions', error);
                alert(MSGS.COMMON_AJAX_DEFAULT_ERROR);
            }
        });
};
 
TreeObjectHandler.prototype.getFunctionOptions = function(){
    return this._functionOptions;
}
 
TreeObjectHandler.prototype._handleFunctionDefinitions = function(definitions) {
    definitions = definitions || [];
    this._functionDefinitions = definitions;
    var options = [];
    for ( var idx = 0; idx < definitions.length; idx++) {
        vardef = definitions[idx];
        options.push({
            fieldId : def.name,
            objectId : def.name,
            label : def.label,
            title : juic.escapeHTML(def.description),
            type : 'function',
            procedure : def.returnType == 'nil' ? true : def.procedure
        });
    }
    this._functionOptions = options;
};
 
TreeObjectHandler.prototype._onDataAvailable = function(response){
                this._fieldData = response;
};
 
TreeObjectHandler.prototype._handleError = function(message, error) {
    error && LOG.error('Error retrieving Data', error);
    alert(MSGS.COMMON_AJAX_DEFAULT_ERROR);
};