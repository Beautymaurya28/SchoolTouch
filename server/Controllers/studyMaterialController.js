const StudyMaterial = require('../models/StudyMaterial.js');
const Student = require('../models/Student.js');



const uploadMaterial = async (req, res) => {
  const { title, description, classId, section, subjectId, fileUrl } = req.body;
  const uploadedBy = req.user.profileId;
  try {
    const newMaterial = new StudyMaterial({
      title, description, class: classId, section, subject: subjectId, fileUrl, uploadedBy
    });
    await newMaterial.save();
    res.status(201).json({ message: 'Study material uploaded successfully', material: newMaterial });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const updateMaterial = async (req, res) => {
    const { title, description, classId, section, subjectId } = req.body;
    const { id } = req.params;

    try {
        const material = await StudyMaterial.findById(id);
        if (!material) return res.status(404).json({ message: 'Study Material not found.' });

        // SECURITY: Only the creator (uploadedBy) or Admin can edit
        if (material.uploadedBy.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to edit this material.' });
        }

        const updatedMaterial = await StudyMaterial.findByIdAndUpdate(
            id,
            { title, description, class: classId, section, subject: subjectId },
            { new: true }
        );
        res.json({ message: 'Study Material updated successfully', material: updatedMaterial });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const deleteMaterial = async (req, res) => {
    const { id } = req.params;
    try {
        const material = await StudyMaterial.findById(id);
        if (!material) return res.status(404).json({ message: 'Study Material not found.' });

        // SECURITY: Only the creator (uploadedBy) or Admin can delete
        if (material.uploadedBy.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this material.' });
        }

        await StudyMaterial.findByIdAndDelete(id);
        res.json({ message: 'Study Material deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMaterials = async (req, res) => {
  const { role, profileId } = req.user;
  let query = {};
  try {
    if (role === 'student' || role === 'parent') {
      let student = null;
      
      // Get the correct student profile for class ID
      if (role === 'student') {
        student = await Student.findById(profileId);
      } else if (role === 'parent') {
        const parent = await Parent.findById(profileId).populate('children');
        if (parent && parent.children.length > 0) {
            // FIX: Fetch the class ID from the child's profile
            student = await Student.findById(parent.children[0]._id);
        }
      }

      if (student && student.class) {
        query = { class: student.class };
      } else {
        return res.json([]); // No class found, return empty array
      }
    }
    
    const materials = await StudyMaterial.find(query)
      .populate('class', 'className section')
      .populate('subject', 'subjectName')
      .populate('uploadedBy', 'name');
      
    res.json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



module.exports = { uploadMaterial, getMaterials,updateMaterial, deleteMaterial };