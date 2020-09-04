const api = {
    endpoint: "/api",
    s3: {
        getS3SignedRequest: async (file) => {
            try {
                const response = await fetch(`${api.endpoint}/sign-s3?file-name=${file.name}&file-type=${file.type}`, {
                    method: "GET"
                });
                if (response.ok) {
                    let data = await response.json();
                    return data;
                }
            } catch (error) {
                console.log(error);
                return null;
            }
        },
        uploadFile: async (file, signedRequest) => {
            try {
                const response = await fetch(`${signedRequest}`, {
                    method: "PUT",
                    body: file
                });
                if (response.ok) {
                    //console.log(response);
                    //let data = await response.json();
                    //console.log(data);
                    return true;
                }
            } catch (error) {
                console.log(error);
                return null;
            }
        }
    },
    lead: {
        deleteOne: async (id) => {
            try {
                const response = await fetch(`${api.endpoint}/lead/${id}`, {
                    method: "DELETE"
                });
                if (response.ok) {
                    let data = await response.json();
                    if (data.deleted === 1) {
                        document.getElementById("lead_" + id).remove();
                        return true;
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    },
    brand: {
        deleteOne: async (id) => {
            try {
                const response = await fetch(`${api.endpoint}/brand/${id}`, {
                    method: "DELETE"
                });
                if (response.ok) {
                    let data = await response.json();
                    if (data.deleted === 1) {
                        document.getElementById("brand_" + id).remove();
                        return true;
                    }
                }
            } catch (error) {
                console.log(error);
            }
        },
        deleteCategory: async (brandCategoryId) => {
            try {
                const response = await fetch(`${api.endpoint}/brand-category/${brandCategoryId}`, {
                    method: "DELETE"
                });
                if (response.ok) {
                    let data = await response.json();
                    if (data.deleted === 1) {
                        document.getElementById("brand_category_" + brandCategoryId).remove();
                        return true;
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    },
};