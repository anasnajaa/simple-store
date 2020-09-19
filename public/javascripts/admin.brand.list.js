const admin_brand_list = ()=>{
    const grid = $(`#gvBrands`);

    const source = {
        datatype: "json",
        type: "POST",
        url: "/admin/brands/all",
        cache: false,
        root: "records",
        id: "id",
        datafields: [
            {name: "id", type: "number"},
            {name: "name", type: "string"},
            {name: "thumbnail_url", type: "string"},
            {name: "date_created", type: "date"},
            {name: "date_updated", type: "date"},
            {name: "categories", type: "json"}
        ],
        beforeprocessing: (data) => {		
            source.totalrecords = data.count;
        },
        sort: () => {
            grid.jqxGrid("updatebounddata");
        },
        filter: () => {
            grid.jqxGrid("updatebounddata", "filter");
        }
    };

    const adapter = new $.jqx.dataAdapter(source, {
        contentType: "application/json;charset=UTF-8",
        formatData: (data)=>{
            source.url = "/api/brands";
            return JSON.stringify(data);
        }
    });

    grid.bind('bindingcomplete', () => { util.gridLocal(grid);});

    grid.jqxGrid({
        source: adapter,
        rtl: false,
        width: "100%",
        pageable: true,
        pagesize: 5,
        altrows: true,
        autorowheight: false,
        rowsheight: 50,
        height: 500,
        virtualmode: true,
        filterable: true,
        sortable: true,
        showfilterrow: true,
        theme: "bootstrap",
        rendergridrows: (args)=>{ return args.data; },
        updatefilterconditions: util.gridFilters,
        columns: [
            {
                text: "Thumbnail", 
                dataField: "thumbnail_url", 
                width: "10%", 
                align: "center", 
                cellsalign: "center", 
                filtercondition: "contains", 
                columntype: "textbox", 
                filtertype: "input",
                filterable: false,
                sortable: false,
                cellsrenderer: (row, dataField, thumbnail_url)=> {
                    return `
                    <div class="text-center">
                        <img width="50" height="50" src="${thumbnail_url}"/>
                    </div>`;
                }
            },
            {
                text: "Name", 
                dataField: "name", 
                width: "20%", 
                align: "center", 
                cellsalign: "center", 
                columntype: "textbox", 
                filterable: true,
                sortable: true,
            },
            {
                text: "Categories", 
                dataField: "categories", 
                width: "45%", 
                align: "center", 
                cellsalign: "center", 
                columntype: "textbox",
                filterable: true,
                sortable: false,
                cellsrenderer: (row, dataField, categories)=> {
                    let tmpl = "";
                    if(categories){
                        categories.forEach(cat=>{
                            tmpl += `<span class="badge badge-pill badge-primary m-1">${cat.name}</span>`;
                        });
                    }
                    return tmpl;
                }
            },
            { 
                text: 'Date C', 
                datafield: 'date_created', 
                width: "15%",
                align: "center", 
                columntype: "date",
                cellsformat: "dd-MM-yyyy hh:mm tt",
                filterable: true,
                sortable: true,
                filtertype: "range"
            },
            {
                text: "Edit", 
                dataField: "edit", 
                columntype: "button",
                width: "5%", 
                align: "center", 
                filterable: false,
                sortable: false,
                cellsrenderer: () => {return `Edit`;},
                buttonclick: (rowIndex) => {
                    const record = grid.jqxGrid("getrowdata", rowIndex);
                    window.location = `/admin/brands/${record.id}`;
                }
            },
            {
                text: "Delete", 
                dataField: "delete", 
                columntype: "button",
                width: "5%", 
                align: "center", 
                filterable: false,
                sortable: false,
                cellsrenderer: () => {return `Delete`;},
                buttonclick: (rowIndex) => {
                    const record = grid.jqxGrid("getrowdata", rowIndex);
                    console.log(record);
                    grid.jqxGrid("deleterow", record.id);
                    grid.jqxGrid("updatebounddata");
                }
            }
        ]
    });

};

admin_brand_list();