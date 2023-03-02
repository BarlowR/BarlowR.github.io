
function get_folders(interface, basePath, replace_underscore_with_spaces) {
    let folders = [];
    let file_map = interface.fileMap[basePath];
    if (file_map == undefined){
        return [""];
    }
    for (child of file_map.children){
        let name = child.name;
        if (replace_underscore_with_spaces){
            name = name.replaceAll("_", " ");
        }
        folders.push(name);
    }
    return folders;
}
module.exports = get_folders;
