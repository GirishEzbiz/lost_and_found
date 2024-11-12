import Link from 'next/link';

const dashboard = () => {
    return (
        <>
            <div className="container px-3">
                <div className="row pt-4">
                    <div className='col'>
                        <div className='d-flex justify-content-between'>
                            <svg width="25" height="20" viewBox="0 0 25 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g opacity="0.94">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.394531 1.59999C0.394531 0.937252 0.93179 0.399994 1.59453 0.399994H23.1945C23.8573 0.399994 24.3945 0.937252 24.3945 1.59999C24.3945 2.26274 23.8573 2.79999 23.1945 2.79999H1.59453C0.93179 2.79999 0.394531 2.26274 0.394531 1.59999ZM0.394531 9.99992C0.394531 9.33718 0.93179 8.79992 1.59453 8.79992H17.1945C17.8573 8.79992 18.3945 9.33718 18.3945 9.99992C18.3945 10.6627 17.8573 11.1999 17.1945 11.1999H1.59453C0.93179 11.1999 0.394531 10.6627 0.394531 9.99992ZM1.59453 17.2C0.93179 17.2 0.394531 17.7373 0.394531 18.4C0.394531 19.0628 0.93179 19.6 1.59453 19.6H23.1945C23.8573 19.6 24.3945 19.0628 24.3945 18.4C24.3945 17.7373 23.8573 17.2 23.1945 17.2H1.59453Z" fill="#646060" />
                                </g>
                            </svg>
                            <svg width="37" height="36" viewBox="0 0 37 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle opacity="0.1" cx="18.5" cy="18" r="17.5" fill="white" stroke="white" />
                                <path d="M23.5 14.6667C23.5 11.9052 21.2614 9.66666 18.5 9.66666C15.7386 9.66666 13.5 11.9052 13.5 14.6667C13.5 20.5 11 22.1667 11 22.1667H26C26 22.1667 23.5 20.5 23.5 14.6667" stroke="#19191A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M19.9417 25.5C19.6435 26.014 19.0942 26.3304 18.5 26.3304C17.9058 26.3304 17.3565 26.014 17.0583 25.5" stroke="#19191A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <circle cx="24" cy="11.5" r="3.5" fill="#02E9FE" stroke="#524CE0" stroke-width="2" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="row pt-4">
                    <div className='col'>
                        <h2 className="text-left fw-bold mt-2">Dashboard</h2>
                    </div>
                </div>
                <div className="row pt-5 row-cols-2">
                    <div className='col'>
                        <div class="card py-5 dashboardcard">
                            <div class="card-body text-center">
                                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0.841064" y="0.733597" width="55" height="55" rx="16" fill="#DBDAF7" />
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.8423 25.6241H15.4242V20.4093C15.4276 19.0308 15.9697 17.7097 16.9321 16.7349C17.8945 15.76 19.1988 15.2108 20.5599 15.2073H35.9982C38.8396 15.2073 41.1489 17.5468 41.1489 20.4093V25.6259H43.7183V28.2269H12.8411L12.8423 25.6241ZM17.993 25.6241H38.5826V20.4093C38.58 19.7178 38.3067 19.0556 37.8227 18.568C37.3386 18.0804 36.6833 17.8072 36.0006 17.8083H20.5599C19.8793 17.8101 19.2271 18.0847 18.7459 18.5721C18.2646 19.0595 17.9935 19.72 17.9918 20.4093L17.993 25.6241ZM41.1501 30.8413V36.0427C41.149 37.4259 40.606 38.7522 39.6403 39.7304C38.6746 40.7085 37.3652 41.2586 35.9994 41.2599H20.5599C17.7336 41.2599 15.4242 38.9204 15.4242 36.0427V30.8431H17.9918V36.0445C17.9907 36.736 18.2604 37.3997 18.7419 37.8899C19.2234 38.3802 19.8772 38.6569 20.5599 38.6595H35.9982C36.683 38.6595 37.3397 38.384 37.8239 37.8936C38.3081 37.4032 38.5802 36.7381 38.5802 36.0445V30.8431L41.1501 30.8413Z" fill="#5A6CF3" />
                                </svg>
                                <h5 class="card-title mt-3">Scan new</h5>
                            </div>
                        </div>
                    </div>
                    <div className='col'>
                        <div class="card py-5 dashboardcard">
                            <div class="card-body text-center">
                                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                                    <rect x="0.5" y="0.733597" width="55" height="55" rx="16" fill="#F6E3DB" />
                                    <rect x="11.337" y="13.2336" width="30" height="30" fill="url(#pattern0_2124_792)" />
                                    <defs>
                                        <pattern id="pattern0_2124_792" patternContentUnits="objectBoundingBox" width="1" height="1">
                                            <use xlinkHref="#image0_2124_792" transform="scale(0.0333333)" />
                                        </pattern>
                                        <image id="image0_2124_792" width="30" height="30" xlinkHref="data:image/png;base64,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" />
                                    </defs>
                                </svg>
                                <h5 class="card-title mt-3">Scan new</h5>
                            </div>
                        </div>
                    </div>
                    <div className='col mt-5'>
                        <div class="card py-5 dashboardcard">
                            <div class="card-body text-center">
                                <svg width="56" height="60" viewBox="0 0 56 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0.5" y="0.305115" width="55" height="59.1498" rx="16" fill="#D8F3F1" />
                                    <path d="M27.5795 39.6658H37.442C37.7326 39.6658 38.0113 39.5503 38.2169 39.3448C38.4224 39.1393 38.5378 38.8606 38.5378 38.57V36.2358C38.5435 35.981 38.4601 35.7321 38.3021 35.5321C38.1441 35.3321 37.9213 35.1934 37.6721 35.14C35.1517 34.4167 34.6476 31.4032 34.1545 25.387C33.8805 22.0995 31.9628 18.812 27.5795 18.812C23.1961 18.812 21.2784 22.0995 21.0045 25.387C20.5113 31.4032 20.0073 34.4167 17.4868 35.14C17.2376 35.1934 17.0148 35.3321 16.8568 35.5321C16.6988 35.7321 16.6155 35.981 16.6211 36.2358V38.57C16.6211 38.8606 16.7366 39.1393 16.9421 39.3448C17.1476 39.5503 17.4263 39.6658 17.717 39.6658H27.5795Z" stroke="#17EEDE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M27.5792 44.0491C26.9979 44.0491 26.4405 43.8181 26.0294 43.4071C25.6184 42.9961 25.3875 42.4387 25.3875 41.8574V39.6657H29.7709V41.8574C29.7709 42.4387 29.5399 42.9961 29.1289 43.4071C28.7179 43.8181 28.1604 44.0491 27.5792 44.0491Z" stroke="#17EEDE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    <circle cx="32.722" cy="20.2193" r="4.50833" fill="white" />
                                    <circle cx="32.722" cy="20.2193" r="3.22024" fill="#FF7E7E" />
                                </svg>
                                <h5 class="card-title mt-3">Scan new</h5>
                            </div>
                        </div>
                    </div>
                    <div className='col mt-5'>
                        <div class="card py-5 dashboardcard">
                            <div class="card-body text-center">
                                <svg width="56" height="60" viewBox="0 0 56 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0.341187" y="0.234924" width="55" height="59.1498" rx="16" fill="#D0EDFB" />
                                    <path d="M21.6689 31.7979C19.8376 32.8883 15.0361 35.1148 17.9606 37.901C19.3891 39.2619 20.9802 40.2353 22.9805 40.2353H34.3949C36.3952 40.2353 37.9863 39.2619 39.4148 37.901C42.3393 35.1148 37.5378 32.8883 35.7065 31.7979C31.4122 29.2408 25.9632 29.2408 21.6689 31.7979Z" stroke="#2EB7FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M34.5124 20.172C34.5124 23.389 31.9046 25.9969 28.6876 25.9969C25.4707 25.9969 22.8628 23.389 22.8628 20.172C22.8628 16.9551 25.4707 14.3472 28.6876 14.3472C31.9046 14.3472 34.5124 16.9551 34.5124 20.172Z" stroke="#2EB7FA" stroke-width="1.5" />
                                </svg>
                                <h5 class="card-title mt-3">Scan new</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='container'>
                <div className='row position-absolute bottom-0' style={{ background: '#fff' }}>
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

export default dashboard;