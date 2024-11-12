import Link from 'next/link';

const scanner = () => {
    return (
        <>
            <div className="container px-3">
                <div className="row pt-4">
                    <div className='col'>
                        <div>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.57 5.92999L3.5 12L9.57 18.07" stroke="#19191A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M20.5 12H3.67" stroke="#19191A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <h2 className="text-center fw-bold mt-2">scanner</h2>
                        </div>
                    </div>
                </div>
                <div className="row pt-4">
                    <div className='col text-center'>
                        <img src='assets/images/scanner.png' className='w-75 mt-5 mb-5' />
                        <button type="button" class="btn createaccount fs-1 mt-4" fdprocessedid="eznc9a">Scan</button>
                    </div>
                </div>
            </div>
            <div className='container'>
                <div className='row position-absolute bottom-0'>
                    <div className='col'>
                        <button className='text-center border-0 bg-transparent'>
                            <svg width="56" height="60" viewBox="0 0 56 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="0.341187" y="0.234924" width="55" height="59.1498" rx="16" fill="#D0EDFB" />
                                <path d="M21.6689 31.7979C19.8376 32.8883 15.0361 35.1148 17.9606 37.901C19.3891 39.2619 20.9802 40.2353 22.9805 40.2353H34.3949C36.3952 40.2353 37.9863 39.2619 39.4148 37.901C42.3393 35.1148 37.5378 32.8883 35.7065 31.7979C31.4122 29.2408 25.9632 29.2408 21.6689 31.7979Z" stroke="#2EB7FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M34.5124 20.172C34.5124 23.389 31.9046 25.9969 28.6876 25.9969C25.4707 25.9969 22.8628 23.389 22.8628 20.172C22.8628 16.9551 25.4707 14.3472 28.6876 14.3472C31.9046 14.3472 34.5124 16.9551 34.5124 20.172Z" stroke="#2EB7FA" stroke-width="1.5" />
                            </svg>
                            <h5 class="card-title mt-3">Home</h5>
                        </button>
                    </div>
                    <div className='col p-0 mx-2'>
                        <button className='text-center border-0 bg-transparent'>
                            <svg width="56" height="60" viewBox="0 0 56 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="0.341187" y="0.234924" width="55" height="59.1498" rx="16" fill="#D0EDFB" />
                                <path d="M21.6689 31.7979C19.8376 32.8883 15.0361 35.1148 17.9606 37.901C19.3891 39.2619 20.9802 40.2353 22.9805 40.2353H34.3949C36.3952 40.2353 37.9863 39.2619 39.4148 37.901C42.3393 35.1148 37.5378 32.8883 35.7065 31.7979C31.4122 29.2408 25.9632 29.2408 21.6689 31.7979Z" stroke="#2EB7FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M34.5124 20.172C34.5124 23.389 31.9046 25.9969 28.6876 25.9969C25.4707 25.9969 22.8628 23.389 22.8628 20.172C22.8628 16.9551 25.4707 14.3472 28.6876 14.3472C31.9046 14.3472 34.5124 16.9551 34.5124 20.172Z" stroke="#2EB7FA" stroke-width="1.5" />
                            </svg>
                            <h5 class="card-title mt-3">items</h5>
                        </button>
                    </div>
                    <div className='col'>
                        <button className='text-center border-0 bg-transparent'>
                            <svg style={{ scale: '1.4' }} width="56" height="60" viewBox="0 0 56 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="0.341187" y="0.234924" width="55" height="59.1498" rx="16" fill="#D0EDFB" />
                                <path d="M21.6689 31.7979C19.8376 32.8883 15.0361 35.1148 17.9606 37.901C19.3891 39.2619 20.9802 40.2353 22.9805 40.2353H34.3949C36.3952 40.2353 37.9863 39.2619 39.4148 37.901C42.3393 35.1148 37.5378 32.8883 35.7065 31.7979C31.4122 29.2408 25.9632 29.2408 21.6689 31.7979Z" stroke="#2EB7FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M34.5124 20.172C34.5124 23.389 31.9046 25.9969 28.6876 25.9969C25.4707 25.9969 22.8628 23.389 22.8628 20.172C22.8628 16.9551 25.4707 14.3472 28.6876 14.3472C31.9046 14.3472 34.5124 16.9551 34.5124 20.172Z" stroke="#2EB7FA" stroke-width="1.5" />
                            </svg>
                            <h5 class="card-title mt-3">Scan</h5>
                        </button>
                    </div>
                    <div className='col'>
                        <button className='text-center border-0 bg-transparent'>
                            <svg width="56" height="60" viewBox="0 0 56 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="0.341187" y="0.234924" width="55" height="59.1498" rx="16" fill="#D0EDFB" />
                                <path d="M21.6689 31.7979C19.8376 32.8883 15.0361 35.1148 17.9606 37.901C19.3891 39.2619 20.9802 40.2353 22.9805 40.2353H34.3949C36.3952 40.2353 37.9863 39.2619 39.4148 37.901C42.3393 35.1148 37.5378 32.8883 35.7065 31.7979C31.4122 29.2408 25.9632 29.2408 21.6689 31.7979Z" stroke="#2EB7FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M34.5124 20.172C34.5124 23.389 31.9046 25.9969 28.6876 25.9969C25.4707 25.9969 22.8628 23.389 22.8628 20.172C22.8628 16.9551 25.4707 14.3472 28.6876 14.3472C31.9046 14.3472 34.5124 16.9551 34.5124 20.172Z" stroke="#2EB7FA" stroke-width="1.5" />
                            </svg>
                            <h5 class="card-title mt-3">notification</h5>
                        </button>
                    </div>
                    <div className='col'>
                        <button className='text-center border-0 bg-transparent'>
                            <svg width="56" height="60" viewBox="0 0 56 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="0.341187" y="0.234924" width="55" height="59.1498" rx="16" fill="#D0EDFB" />
                                <path d="M21.6689 31.7979C19.8376 32.8883 15.0361 35.1148 17.9606 37.901C19.3891 39.2619 20.9802 40.2353 22.9805 40.2353H34.3949C36.3952 40.2353 37.9863 39.2619 39.4148 37.901C42.3393 35.1148 37.5378 32.8883 35.7065 31.7979C31.4122 29.2408 25.9632 29.2408 21.6689 31.7979Z" stroke="#2EB7FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M34.5124 20.172C34.5124 23.389 31.9046 25.9969 28.6876 25.9969C25.4707 25.9969 22.8628 23.389 22.8628 20.172C22.8628 16.9551 25.4707 14.3472 28.6876 14.3472C31.9046 14.3472 34.5124 16.9551 34.5124 20.172Z" stroke="#2EB7FA" stroke-width="1.5" />
                            </svg>
                            <h5 class="card-title mt-3">Profile</h5>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default scanner;