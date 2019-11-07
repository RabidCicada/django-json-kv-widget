/*!
 * jsTree 3.3.8
 * http://jstree.com/
 *
 * Copyright (c) 2014 Ivan Bozhanov (http://vakata.com)
 *
 * Licensed same as jquery - under the terms of the MIT License
 *   http://www.opensource.org/licenses/mit-license.php
 */

/** For this entire javascript module:
 * Please note Object (with a capital 'O') means the literal javascript type 'Object'
 *
 * The purpose of this module is to automatically parse and render json data into a jstree GUI.
 *
 * This module instantiates a modified jstree that has been setup and improved
 * to handle key:value display and folder like behavior so that it can serve as a simple graphical
 * json key:value editor that allows grouping.
 *
 * It initializes every json_kv_widget div by using the value of the element referenced
 * on that div's data-target attribute.  It expects this field to be in a form and likely an input element
 * upon a 'submit' event it automatically serializes the jstree data back out and into
 * the same element.
 *
 * It expects incoming json to be well formatted as a root level array, that is full
 * of either single entry key:value Objects ({key:val}) or a group as a key:[{key:val},{key:val},...].
 * These raw key:val's and groups may be nested recurively.
 *
 */


/**
 * Takes a native key:val data collection and constructs the jstree compatible data elements
 *
 * This function is highly recursive and dives through the Objects and arrays constructing
 * jstree compatible elements from the regular elements
 * It expects the json to largely be an array of key:val scalars and if there are groups/folders
 * of related key:vals then it expects them to be organised as 'folderkey:[{key:val},...]'s
 * The reason is that arrays are orderable while Objects are not.  We want to let the
 * user order the key:vals as desired.  Keys with arrays will be folders and empty folders are allowed.
 * We make attempts to ingest children in 'folderkey:{key:val,...}'s Objects but they
 * will be converted to our desired format on export with extractNodeData()
 *
 * Example: '[{"key":"value"},{"folder1":[{"key1":"value1"},{"key2":"value2"}]},{"folder2":[]}]'
 * Valid but will be converted:
 * '[{"key":"value"},{"folder1":{"key1":"value1","key2":"value2"}},{"folder2":[]}]'
 * @name assemblejstreejson(obj)
 * @param {Object} obj constructed from json key:val data collection
 * @return {Object} converted for use by jstree
 */

function assemblejstreejson(obj) {
  var obj_children = []

  if (Array.isArray(obj)) {  //If array...Return the array of processed elements

    obj.forEach( (element) => {
      obj_children.push(...assemblejstreejson(element) );
    });

  }else if(typeof obj === 'object' && obj !== null){

    //Walk the key:val's of the javascript Object
    //There should only be one key:val pair
    //That value should only be a scalar or an array...but we also try to handle
    //Multi element/key:val Objects as well as arrays

    //Get the key:val entries of the Object
    entries = Object.entries(obj)

    // Process a single key:val item whose value is not an Array
    // Regular key:val object
    if(entries.length == 1 && !Array.isArray(entries[0][1])){
      return [{
        "text": entries[0][0],
        "databag": {"special":entries[0][1]}
      }]
    }else{
      //Try to nicely process children objects to jstree format
      //Should be a top level array...but we try to gracefully handle
      //dict/object's with multiple key/val's
      var nestedchildren = []

      for (const [key, value] of entries) {

        //If the object has subobjects, dive into them as folders and make them into Array of children
        if (Array.isArray(value)) {
          nestedchildren.push(...assemblejstreejson(value))
          obj_children.push({
            "text": key,
            "children": nestedchildren,
            "type": "folder"
          })
        } else if (typeof value === 'object') {
          nestedchildren.push(...assemblejstreejson(value))
          obj_children.push({
            "text": key,
            "children": nestedchildren,
            "type": "folder"
          })
        } else { //If the value is a scalar, then simply create a key:val mapping
          obj_children.push({
            "text": key,
            "databag": {"special":value}
          });
        }

      }

    }
  }
  return obj_children
}


/**
 * Takes a native json key:val data collection and constructs the jstree compatible metadata
 *
 * This function sets up the theme and types and plugins then calls the primary element
 * conversiont workhorse function assemblejstreejson() to convert the actual data elements
 * of the json data
 * @name generatejstreeData(obj)
 * @param {Object} obj constructed from json key:val data collection
 * @return {Object} converted for use by jstree
 */
function generatejstreeData(obj) {
  var jstreedata = {
    "core": {
      "data": [],
       "check_callback" : true, //Necessary for dnd,search,context and unique plugins
       "value_box": true,
       "allow_empty_text": true,
       "themes" : {
         "variant" : "large"
       }
    },
    "types" : {
      "default" : {
        "icon" : "fa fa-key",
        "databag" : {"special":"DEFAULT"},
        "max_children": 0
      },
      "folder" : {
        "icon" : "fa fa-folder-open",
        "databag" : {"special":""},
        "max_children": -1
      },
    },
    "plugins" : [ "dnd","contextmenu","search", "types", "unique"]
  }

  jstreedata['core']['data'] = assemblejstreejson(obj)
  return jstreedata
}

/**
 * Takes jstree compatible data and exports our desired format for the data collection
 *
 * This function recursively dives intot he the jstree data elements and converts them
 * to our desired format
 * @name extractNodeData(obj, nested)
 * @param {Mixed} obj data elements from jstree
 * @param {Boolean} nested flag noting if this is a nested call
 * @return {Object} converted for use by jstree
 */
function extractNodeData(obj, nested){
  var data = []

  if (!nested && Array.isArray(obj) ){ // Process root data Array
    //Extract children into an Array of sub values (No key to use)
    obj.forEach( (element) => {
      data.push(extractNodeData(element,true));
    });
  }else if( obj.hasOwnProperty("type") && obj.type == "folder"){ // Folder
    //Extract children into an Array of sub values
    data =[];
    obj.children.forEach( (element) => {
      data.push(extractNodeData(element,true));
    });
    data = {[obj.text]:data}
  }else if ( obj.hasOwnProperty('databag') && obj.databag.hasOwnProperty('special')){ // Regular key:val
    data = {[obj.text] : obj.databag.special };
  }else  {
    console.log("Unexpected object: "+ JSON.stringify(obj,null,2))
    alert("Whoa...should not happen")
  }
  return data
}

function updateInput($json_kv_widget){
  var $target = $("#" + $json_kv_widget.data('target'));
  var jstreedata = $json_kv_widget.jstree(true).get_json('#');
  var jsonwidgetdata = extractNodeData(jstreedata);
  var jsonwidgetdatastringified = JSON.stringify(jsonwidgetdata);
  $target.attr('value',jsonwidgetdatastringified).trigger('change');
}

$(document).ready(function() {

  //Put one time initialization code here.  Use variables without 'var' if you need
  //persistent global variables
  if(typeof json_kv_widget_onetime_done === 'undefined'){
    json_kv_widget_onetime_done=true;
    //Stop propagation of contextmenu-item clicks so that panels/asides don't unfocus themselves
    $(document).on("context_show.vakata", function(event, data){
      data.element.on("click", "a", function (e) {
        e.stopPropagation();
      });
    });
  }

  //Initialize all .json_kv_widget elements with jstree and data linked by data-target
  $('.json_kv_widget').each(function() {
    var $json_kv_widget = $(this);

    var kvjstree = null
    kvjstree = $json_kv_widget.jstree(true);//Only get if exists...don't try to create

    //Handle only '.json_kv_widget's that haven't been initialized
    if(!kvjstree) {

      //It is expected that each 'json_kv_widget' element has a data-target Attribute
      //whose value is the id of the input with the json data to source from.
      var $target = $("#" + $json_kv_widget.data('target'));

      //Get Initializing data
      var data = $.parseJSON($target.val());

      //Generate jstree data structure
      var inputdata = generatejstreeData(data);

      //Bind data into jstree (construct GUI of keyvals)
      kvjstree = $json_kv_widget.jstree(inputdata)

      //Bind handler to create new folder at root level
      var $newfolder_button = $json_kv_widget.prevAll(".jstree_newfolder")
      $newfolder_button.click(function(event){
        var kvjstree = $json_kv_widget.jstree(true)
        kvjstree.create_node(null, { ["type"]:"folder"}, "last", function (new_node) {
          try {
            kvjstree.edit(new_node);
          } catch (ex) {
            setTimeout(function () { kvjstree.edit(new_node); },0);
          }
        });
      });

      //Bind handler to create new root level key:val
      var $newfolder_button = $json_kv_widget.prevAll(".jstree_newkeyval")
      $newfolder_button.click(function(event){
        var kvjstree = $json_kv_widget.jstree(true)
        kvjstree.create_node(null, {}, "last", function (new_node) {
          try {
            kvjstree.edit(new_node);
          } catch (ex) {
            setTimeout(function () { kvjstree.edit(new_node); },0);
          }
        });
      });

      //Debug print structure after generation
      // $json_kv_widget.bind('ready.jstree', function (e, data) {
      //   // console.log("Element "+ Object.getOwnPropertyNames($e))
      //   var jstreedata = $json_kv_widget.jstree(true).get_json('#');
      //   //console.log("jstree Internal: "+JSON.stringify(jstreedata,null,2));
      // });

      //Update the input box after everything that affects the model
      $json_kv_widget.on("redraw.jstree move_node.jstree delete_node.jstree create_node.jstree copy_node.jstree rename_node.jstree", function(event){
        console.log("UpdateInputBox")
        updateInput($json_kv_widget)
      });

      //The below solution was used before we just started updating the input box on every
      //event that touched the json.

      //Bind event handler to the form's submit button for this json_kv_widget
      //Uses 'one' time event handler so it can fix data then call submit again without infinite loop
      // $json_kv_widget.closest("form").one('submit', function(event){
      //   event.preventDefault();//Prevent this form capture (it packed up data before we modified it)
      //   updateInput($json_kv_widget)
      //   $(this).submit();
      // });
    }


  });



});
