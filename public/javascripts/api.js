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
};