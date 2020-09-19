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
        getOne: async (id) => {
            try {
                const response = await fetch(`${api.endpoint}/brands/${id}`, {method: "GET"});
                if (response.ok) {
                    return await response.json();
                } else {
                    return null;
                }
            } catch (error) {
                console.log(error);
                return null;
            }
        },
        postOne: async (id, data) => {
            try {
                const response = await fetch(`${api.endpoint}/brands/${id ? id : ""}`, 
                {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: {"Content-type": "application/json;charset=UTF-8"} 
                });
                if (response.ok) {
                    return await response.json();
                } else {
                    return null;
                }
            } catch (error) {
                console.log(error);
                return null;
            }
        },
        uploadThumbnail: async (id, fileInputId) => {
            try {
                const inputFile = document.getElementById(fileInputId);
                const formData = new FormData();
                formData.append('file_brand_thumbnail', inputFile.files[0]);
                const response = await fetch(`${api.endpoint}/brands/${id}/upload/thumbnail`, 
                {
                    method: "POST",
                    body: formData
                });
                if (response.ok) {
                    return await response.json();
                } else {
                    return null;
                }
            } catch (error) {
                console.log(error);
                return null;
            }
        },
        removeThumbnail: async (id) => {
            try {
                const formData = new FormData();
                formData.append('delete_thumb', "1");
                const response = await fetch(`${api.endpoint}/brands/${id}/upload/thumbnail`, 
                {
                    method: "POST",
                    body: formData
                });
                if (response.ok) {
                    return await response.json();
                } else {
                    return null;
                }
            } catch (error) {
                console.log(error);
                return null;
            }
        },
        updateOne: async (id, data) => {
            try {
                const response = await fetch(`${api.endpoint}/brands/${id}`, 
                {
                    method: "PUT",
                    body: JSON.stringify(data),
                    headers: {"Content-type": "application/json;charset=UTF-8"} 
                });
                if (response.ok) {
                    return await response.json();
                } else {
                    return null;
                }
            } catch (error) {
                console.log(error);
                return null;
            }
        },
        deleteOne: async (id) => {
            try {
                const response = await fetch(`${api.endpoint}/brands/${id}`, {
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
    category: {
        getAll: async () => {
            try {
                const response = await fetch(`${api.endpoint}/categories`, {method: "GET"});
                if (response.ok) {
                    return await response.json();
                } else {
                    return null;
                }
            } catch (error) {
                console.log(error);
                return null;
            }
        },
    }
};