import reviewModel from '../models/reviewModel.js';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';



const submitRating = async (req, res) => {
    try {
        const { doctorId, appointmentId, rating } = req.body;
        const patientId = req.userId;

        if (!rating || rating < 1 || rating > 5) {
            return res.json({ success: false, message: 'please give rating between 1 to 5' });
        }

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }
        if (!appointment.isCompleted) {
            return res.json({ success: false, message: 'You can rate after complete Appointment.' });
        }
        if (appointment.userId.toString() !== patientId) {
            return res.json({ success: false, message: 'it is not you appointment' });
        }

        let review = await reviewModel.findOne({ appointment: appointmentId });

        if (review) {
            review.rating  = rating;
            review.isRated = true;
            await review.save();

            return res.json({
                success:  true,
                message:  'Rating updated now you can comment.',
                reviewId: review._id,
                step:     'rating_done'
            });
        }

        review = new reviewModel({
            doctor:      doctorId,
            patient:     patientId,
            appointment: appointmentId,
            rating,
            isRated:     true,
            isReviewed:  false
        });

        await review.save();

        res.json({
            success:  true,
            message:  `${rating}  rating submitted now you can write review`,
            reviewId: review._id,
            step:     'rating_done'
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};



const submitComment = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { comment }  = req.body;
        const patientId    = req.userId;

        if (!comment || comment.trim() === '') {
            return res.json({ success: false, message: 'Review should not be empty ' });
        }

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: 'First give Star rating' });
        }

        if (review.patient.toString() !== patientId) {
            return res.json({ success: false, message: 'Unauthorized' });
        }

        if (!review.isRated) {
            return res.json({ success: false, message: 'first click star then give rating' });
        }

        if (review.isReviewed) {
            return res.json({ success: false, message: ' You already  give Comment ,now you can edit ' });
        }

        review.comment    = comment.trim();
        review.isReviewed = true;
        await review.save();

        res.json({
            success: true,
            message: 'Review completed',
            review,
            step:    'review_done'
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};



const editReview = async (req, res) => {
    try {
        const { id }           = req.params;
        const { rating, comment } = req.body;
        const patientId        = req.userId;

        const review = await reviewModel.findById(id);
        if (!review) {
            return res.json({ success: false, message: 'Review not found' });
        }

        if (review.patient.toString() !== patientId) {
            return res.json({ success: false, message: 'You can edit own review' });
        }

        if (rating) {
            if (rating < 1 || rating > 5) {
                return res.json({ success: false, message: 'give rating between 1 to 5' });
            }
            review.rating = rating;
        }

        if (comment) {
            review.comment    = comment.trim();
            review.isReviewed = true;
        }

        await review.save();

        res.json({ success: true, message: 'Review updated', review });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};



const deleteReview = async (req, res) => {
    try {
        const { id }    = req.params;
        const patientId = req.userId;

        const review = await reviewModel.findById(id);
        if (!review) {
            return res.json({ success: false, message: 'Review not found' });
        }

        if (review.patient.toString() !== patientId) {
            return res.json({ success: false, message: 'You can delete own review' });
        }

        await reviewModel.findByIdAndDelete(id);

        res.json({ success: true, message: 'Review deleted' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};



const getDoctorReviews = async (req, res) => {
    try {
        const { id } = req.params;

        const reviews = await reviewModel
            .find({ doctor: id })
            .populate('patient', 'name image')
            .select('rating comment isRated isReviewed createdAt')
            .sort({ createdAt: -1 });

        const breakdown = await reviewModel.aggregate([
            { $match: { doctor: new mongoose.Types.ObjectId(id) } },
            { $group: { _id: '$rating', count: { $sum: 1 } } }
        ]);

        const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        breakdown.forEach(item => { ratingBreakdown[item._id] = item.count; });

        const totalReviews  = reviews.length;
        const averageRating = totalReviews > 0
            ? parseFloat(
                (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
              )
            : 0;

        res.json({
            success: true,
            summary: { averageRating, totalReviews, ratingBreakdown },
            reviews
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


export { submitRating, submitComment, editReview, deleteReview, getDoctorReviews };