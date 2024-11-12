import Link from 'next/link';
import Support from './support';

const scanner = () => {
    return (
        <>
            <div className="container px-3">
                <div className="row pt-4">
                    <div className='col'>
                        <div className='d-flex justify-content-center align-items-center'>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.57 5.92999L3.5 12L9.57 18.07" stroke="#19191A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M20.5 12H3.67" stroke="#19191A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <h2 className="text-center fw-bold mt-2 w-100">scanner</h2>
                        </div>
                    </div>
                </div>
                <div className="row pt-4">
                    <div className='col text-center'>
                        <img src='assets/images/scanner.png' className='scannerwidth mt-3 mb-5' />
                        <button type="button" class="btn createaccount fs-1 mt-1" fdprocessedid="eznc9a">Scan</button>
                    </div>
                </div>
            </div>
            <Support name="shubham" />
        </>
    );
};

export default scanner;