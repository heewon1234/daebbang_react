import { Route, Routes } from 'react-router-dom';
import WriteReview from './Write/WriteReview';
import EditReview from './Edit/EditReview';
import style from './Review.module.css';
import ReviewBoard from './Board/ReviewBoard/ReviewBoard';


const Review = () => {
    return (
        <div className={style.container}>
            <Routes>
                <Route path="/writeReview" element={<WriteReview/>}></Route>
                <Route path="/editReview" element={<EditReview/>}></Route>
                <Route path="/boardReview" element={<ReviewBoard/>}></Route>
            </Routes>
        </div>
    );
}

export default Review;