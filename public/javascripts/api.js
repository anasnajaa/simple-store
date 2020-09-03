const api = {
    endpoint: "/api",
    lead: {
        deleteOne: async (id) => {
            try {
                const response = await fetch(`${api.endpoint}/lead/${id}`, {method: "DELETE"});
                if(response.ok){
                    let data = await response.json();
                    if(data.deleted === 1) {
                        document.getElementById("lead_"+id).remove();
                        return true;
                    }
                }
            } catch (error) { console.log(error); }
        }
    },
    brand: {
        deleteOne: async (id) => {
            try {
                const response = await fetch(`${api.endpoint}/brand/${id}`, {method: "DELETE"});
                if(response.ok){
                    let data = await response.json();
                    if(data.deleted === 1) {
                        document.getElementById("brand_"+id).remove();
                        return true;
                    }
                }
            } catch (error) { console.log(error); }
        },
        deleteCategory: async (brandCategoryId) => {
            try {
                const response = await fetch(`${api.endpoint}/brand-category/${brandCategoryId}`, {method: "DELETE"});
                if(response.ok){
                    let data = await response.json();
                    if(data.deleted === 1) {
                        document.getElementById("brand_category_"+brandCategoryId).remove();
                        return true;
                    }
                }
            } catch (error) { console.log(error); }
        }
    },
};