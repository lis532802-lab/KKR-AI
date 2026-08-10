export const handleFileUpload = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
            reader.onload = () => resolve({ type: 'image', data: reader.result, name: file.name });
        } else {
            reader.readAsText(file);
            reader.onload = () => resolve({ type: 'text', data: reader.result, name: file.name });
        }
        reader.onerror = (error) => reject(error);
    });
};
