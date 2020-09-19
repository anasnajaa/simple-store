const admin_brand_details = async ()=>{
    const recordId = $("#record").data( "id");
    const txtBrandName = $("#txt_brand_name");
    const fileBrandThumbnail = $('#file_brand_thumbnail');
    const imgBrandThumbnailPreview = $('#img_brand_thumbnail_preview');
    const gridBrandCategories = $("#grid_brand_categories");
    const selectCategories = $("#select_categories");
    const btnAddCategory = $("#btn_add_category");
    const loaderMain = $("#loader_main");
    const formMain = $("#form_main");
    const alertMain = $("#alert_main");
    const btnSave = $("#btn_save");
    const btnCancel = $("#btn_cancel");

    formMain.hide();
    loaderMain.hide();

    btnAddCategory.jqxButton({ width: '150', height: '25'});

    txtBrandName.jqxInput({ 
        placeHolder: "Brand Name", 
        height: 25, 
        width: "100%", 
        minLength: 1, 
        theme: 'bootstrap'
    });

    const showForm = (brand, categories)=> {
        let fileChanged = false;
        txtBrandName.val(brand.name);
        `/api/brands/${brand.id}/upload`

        if(brand.thumbnail){
            imgBrandThumbnailPreview.prop("src", brand.thumbnail_url);
        } else {
            imgBrandThumbnailPreview.prop("src", "https://via.placeholder.com/150");
        }

        util.listenForFileChanges('file_brand_thumbnail', ()=>{
            fileChanged = true;
        });

        const categoriesSource = {
            dataType: "json",
            id: "id",
            dataFields: [
                { name: 'id', type: "number" },
                { name: 'brand_category_id', type: "number" },
                { name: 'name', type: "string" },
                { name: 'thumbnail', type: "string" },
                { name: 'thumbnail_url', type: "string" }
            ]
        };

        const categoriesAdapter = new $.jqx.dataAdapter({localData: brand.categories , ...categoriesSource});

        gridBrandCategories.jqxGrid({
            source: categoriesAdapter,
            rtl: false,
            width: "100%",
            altrows: true,
            autorowheight: true,
            rowsheight: 30,
            autoheight: true,
            theme: "bootstrap",
            columns: [
                { text: "Name", dataField: "name", width: "80%", align: "left", cellsalign: "center", columntype: "textbox" },
                {
                    text: "Delete", 
                    dataField: "delete", 
                    columntype: "button",
                    width: "20%", 
                    align: "center", 
                    cellsrenderer: () => {return `Delete`;},
                    buttonclick: (rowIndex) => {
                        const record = gridBrandCategories.jqxGrid("getrowdata", rowIndex);
                        gridBrandCategories.jqxGrid("deleterow", record.id);
                    }
                }
            ]
        });

        const dataAdapter = new $.jqx.dataAdapter({localData: categories ,...categoriesSource});
        
        selectCategories.jqxDropDownList({
            selectedIndex: 0, 
            source: dataAdapter, 
            displayMember: "name", 
            valueMember: "id", 
            width: 200, 
            height: 30
        });

        btnAddCategory.on("click", ()=>{
            const selectedItem = selectCategories.jqxDropDownList('getSelectedItem').originalItem;
            const isItemAdded = gridBrandCategories.jqxGrid('getrowdatabyid', selectedItem.id);
            if(!isItemAdded){
                gridBrandCategories.jqxGrid('addrow', selectedItem.id, selectedItem);
            }
        });

        btnSave.on("click", async ()=>{
            if(fileChanged){
                const res = await api.brand.uploadThumbnail(brand.id, "file_brand_thumbnail");
                if(res){
                    //removeThumbnail
                }
            }
        });
    }


    // Start Page

    loaderMain.show();

    const categories = await api.category.getAll();

    if(categories === null){
        alertMain.html(`<div class="alert alert-danger" role="alert">Failed to load categories data!</div>`);
    }

    if(recordId !== 0){
        const brand = await api.brand.getOne(recordId);
        
        if(brand){
            showForm(brand, categories);
            formMain.show();
        } else {
            alertMain.html(`<div class="alert alert-danger" role="alert">Failed to load data!</div>`);
        }

    } else {
        showForm({
            name: "",
            thumbnail: null,
            thumbnail_url: "",
            categories: []
        }, categories);
    }

    loaderMain.hide();
};

admin_brand_details();