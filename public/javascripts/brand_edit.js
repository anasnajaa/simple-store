util.listenForFileChanges("u_brand_thumb", async (file)=>{
    if(file){
        const response = await api.s3.getS3SignedRequest(file);
        if(response){
            console.log(response);
            const imgUrl = response.url;
            const fileUploaded = await api.s3.uploadFile(file, response.signedRequest);
            console.log(fileUploaded);
            if(fileUploaded){
                document.getElementById('brand_preview').src = imgUrl;
                document.getElementById('thumbnail_url').value = imgUrl;
            } else {
                alert("Upload Failed");
            }
        } else {
            alert("Upload Failed");
        }
    } else {

    }
});