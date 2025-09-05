import React, { useContext, useState } from 'react';
import noteContext from '../context/notes/noteContext';

const AddNote = (props) => {
    const context = useContext(noteContext);
    const { addNote } = context;

    const [note, setNote] = useState({
        title: "",
        destination: "",
        startDate: "",
        endDate: "",
        budget: "",
        travelType: "",
        description: "",
        tag: ""
    });

    const [images, setImages] = useState([]);
    const [featuredImage, setFeaturedImage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);

    const handleClick = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (note.title.length < 3 || note.description.length < 5) {
            props.showAlert("Title must be at least 3 characters and description at least 5 characters", "error");
            return;
        }

        // Upload images first if any are selected
        let uploadedImages = [];
        let uploadedFeaturedImage = "";

        if (images.length > 0) {
            setUploading(true);
            try {
                const formData = new FormData();
                images.forEach(file => {
                    formData.append('noteImages', file);
                });

                const response = await fetch('http://localhost:5000/api/notes/upload-images', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to upload images');
                }

                const result = await response.json();
                uploadedImages = result.filePaths;
                uploadedFeaturedImage = uploadedImages[0] || "";
                
                console.log('Uploaded images:', uploadedImages);
                console.log('Featured image:', uploadedFeaturedImage);
            } catch (error) {
                console.error("Image upload error:", error);
                props.showAlert("Failed to upload images", "error");
                setUploading(false);
                return;
            }
            setUploading(false);
        }

        // Add note with image paths
        const success = await addNote(
            note.title, 
            note.destination, 
            note.startDate, 
            note.endDate, 
            note.budget, 
            note.travelType, 
            note.description, 
            note.tag,
            uploadedImages,
            uploadedFeaturedImage
        );

        if (success) {
            setNote({
                title: "",
                destination: "",
                startDate: "",
                endDate: "",
                budget: "",
                travelType: "",
                description: "",
                tag: ""
            });
            setImages([]);
            setFeaturedImage("");
            setPreviewImages([]);
            props.showAlert("Note added successfully", "success");
        } else {
            props.showAlert("Failed to add note", "error");
        }
    };

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            props.showAlert("Maximum 5 images allowed", "error");
            return;
        }

        setImages(files);
        
        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(previews);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = previewImages.filter((_, i) => i !== index);
        setImages(newImages);
        setPreviewImages(newPreviews);
    };

    return (
        <div>
            <div className='container my-3'>
                <h1>Create a Tour Post...</h1>
                <form className='my-3'>
                    <div className="mb-3">
                        <label htmlFor="title" className="form-label">Title</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="title" 
                            name="title" 
                            value={note.title} 
                            onChange={onChange} 
                            minLength={3} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="destination" className="form-label">Destination</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="destination" 
                            name="destination" 
                            value={note.destination} 
                            onChange={onChange} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="startDate" className="form-label">Start Date</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            id="startDate" 
                            name="startDate" 
                            value={note.startDate} 
                            onChange={onChange} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="endDate" className="form-label">End Date</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            id="endDate" 
                            name="endDate" 
                            value={note.endDate} 
                            onChange={onChange} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="budget" className="form-label">Budget ($)</label>
                        <input 
                            type="number" 
                            className="form-control" 
                            id="budget" 
                            name="budget" 
                            value={note.budget} 
                            onChange={onChange} 
                            required 
                            min="0"
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="travelType" className="form-label">Travel Type</label>
                        <select 
                            className="form-control" 
                            id="travelType" 
                            name="travelType" 
                            value={note.travelType} 
                            onChange={onChange} 
                            required
                        >
                            <option value="">Select a travel type</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Relax">Relax</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Backpacking">Backpacking</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea 
                            className="form-control" 
                            id="description" 
                            name="description" 
                            value={note.description} 
                            onChange={onChange} 
                            minLength={5} 
                            required
                            rows="4"
                        ></textarea>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="tag" className="form-label">Tag</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="tag" 
                            name="tag" 
                            value={note.tag} 
                            onChange={onChange} 
                            placeholder="e.g., Budget Travel, Luxury, Solo" 
                        />
                    </div>
                    
                    {/* Image Upload Section */}
                    <div className="mb-3">
                        <label htmlFor="images" className="form-label">
                            Tour Images (Optional - Max 5 images)
                        </label>
                        <input 
                            type="file" 
                            className="form-control" 
                            id="images" 
                            multiple 
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <div className="form-text">
                            Upload images to showcase your tour. First image will be the featured image.
                        </div>
                    </div>

                    {/* Image Previews */}
                    {previewImages.length > 0 && (
                        <div className="mb-3">
                            <label className="form-label">Image Previews:</label>
                            <div className="row">
                                {previewImages.map((preview, index) => (
                                    <div key={index} className="col-md-3 mb-2">
                                        <div className="position-relative">
                                            <img 
                                                src={preview} 
                                                alt={`Preview ${index + 1}`}
                                                className="img-fluid rounded shadow-sm"
                                                style={{ height: '120px', objectFit: 'cover', width: '100%' }}
                                            />
                                            <button 
                                                type="button"
                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                                onClick={() => removeImage(index)}
                                                style={{ fontSize: '12px', padding: '2px 6px' }}
                                            >
                                                ×
                                            </button>
                                            {index === 0 && (
                                                <span className="badge bg-primary position-absolute bottom-0 start-0 m-1">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button 
                        disabled={note.title.length < 3 || note.description.length < 5 || uploading} 
                        type="submit" 
                        className="btn btn-success" 
                        onClick={handleClick}
                    >
                        {uploading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Uploading...
                            </>
                        ) : (
                            'Post Tour'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddNote;