import { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { myContext } from './myContext';


function Container({ children }) {
    return (
        <>
            <div className=" mb-3   ">
                {children}
            </div>
        </>
    );
}


function ContainerNav({ data, common, setCommon, setContainer, children, isDefault = null, thekey }) {

    const aref = useRef(null);
    const [lstate, setlstate] = useState('border-slate-400');



    function handleClick() {
        setlstate('border-reen-200');
        setContainer(data);


        if (common.current) {
            if (common.current.previousKey !== thekey) {
                common.current.previous();
            }
        }

        if (setCommon) {
            console.log('from ContainerNav , the typeof setcommon : ', typeof setCommon);
            setCommon({ previous: setOff, previousKey: thekey });
        }

    }

    function setOff() {
        setlstate('border-slate-400');

    }

    useEffect(() => {
        if (isDefault) {
            handleClick();
            setlstate('border-reen-200');
        }
    }, [])


    return (
        <>

            <button ref={aref} onClick={handleClick}
                className={` ${lstate} m-1 p-3 font-serif 
                hover:bg-green-700 border-2  text-green-200
               text-[1.2rem] rounded-md`}>
                {children}
            </button>
        </>
    );
}

function Card({ companyName, imgSrc, jobHeading,
    timeAgo, tag, prev, index, location,
    dataToSetOnState, setState, isDefault, __note_this_component_use_context_and_i_am_a_message__ }) {

    const { theClick } = useContext(myContext);
    // console.log('from Card : the theClick : ', theClick)
    const aref = useRef(null);
    const [lstate, setlstate] = useState('border-green-900');
    const navigate = useNavigate();

    function off() {
        setlstate('border-green-900');
    }

    function handleClick() {
        if (theClick.current === 'link') {
            //alert('going to use link');
            // navigate('/jobDetial/' + dataToSetOnState.no);

            return;
        }

        //console.log('from card : ', dataToSetOnState.no);
        setlstate('border-slate-400');
        setState(dataToSetOnState);
        //console.log('from cards the state function ; ', setState);
        // console.log('the data to set on state : ', dataToSetOnState);
        if (prev.current.off && prev.current.index !== index) {
            prev.current.off();
        }
        prev.current = { index: index, off: off }
    }

    useEffect(() => {

        if (theClick.current !== 'link') {

            if (isDefault) {
                handleClick();
            }
        }

    }, [theClick.current])

    return (
        <>
            {theClick.current === 'link' ?
                <Link to={'/jobDetail/' + dataToSetOnState.no}>
                    <div ref={aref} onClick={handleClick}
                        className={` flex flex-col m-2 p-2 
             items-start border 
             ${lstate} rounded-lg  text-green-200
             hover:bg-green-900 active:bg-green-800`}>

                        <div className="flex flex-row text-[0.8rem] 
         justify-between w-full">
                            <div>{timeAgo} Ago</div> <div className='p-1
              text-slate-500 text-[0.8rem] bg-blue-950'>{tag}</div>
                        </div>

                        <div className='flex flex-row flex-wrap
         flex-start w-full items-center'>

                            <img className='m-1 size-8 rounded-full'
                                src={imgSrc ? imgSrc : null} alt='company image'></img>
                            <div className='text-[1.2rem] text-green-600
             font-serif ml-2
             '>{companyName}</div>
                        </div>

                        <div className='text-[1rem] mt-1 '>{jobHeading}</div>
                        <div className='text-[0.8rem] relative bottom-1 
         
         '>{location ? location : "DumyBad, India"}</div>
                        <hr className='w-full m-1 border-1 border-green-800 rounded-md'></hr>

                        <div className='p-1 m-1 text-green-300 
         font-serif self-start text-[0.8rem]
         bg-green-900 rounded-r-2xl' >{tag}</div>

                    </div>
                </Link>
                :
                <div ref={aref} onClick={handleClick}
                    className={` flex flex-col m-2 p-2 
             items-start border 
             ${lstate} rounded-lg  text-green-200
             hover:bg-green-900 active:bg-green-800`}>

                    <div className="flex flex-row text-[0.8rem] 
         justify-between w-full">
                        <div>{timeAgo} Ago</div> <div className='p-1
              text-slate-500 text-[0.8rem] bg-blue-950'>{tag}</div>
                    </div>

                    <div className='flex flex-row flex-wrap
         flex-start w-full items-center'>
                        <img className='m-1 size-8 rounded-full' src={imgSrc} alt='company image'></img>
                        <div className='text-[1.2rem] text-green-600
             font-serif ml-2
             '>{companyName}</div>
                    </div>

                    <div className='text-[1rem] mt-1 '>{jobHeading}</div>
                    <div className='text-[0.8rem] relative bottom-1 
         
         '>{location ? location : "DumyBad, India"}</div>
                    <hr className='w-full m-1 border-1 border-green-800 rounded-md'></hr>

                    <div className='p-1 m-1 text-green-300 
         font-serif self-start text-[0.8rem]
         bg-green-900 rounded-r-2xl' >{tag}</div>

                </div>
            }

        </>
    );
}

function Filter({ }) {
    const [filterData, setfilterData] = useState({ prev: [], curr: [], app: [] });
    console.log('the filter Data is : ', filterData);
    const [panel, setPanel] = useState({
        isActivated: false, activate: null,
        deActivate: null
    });

    function handleActivate() {
        setPanel((prev) => {
            let newOne = { ...prev };
            newOne.isActivated = true;
            return newOne;
        })
    }

    function handleDeActivate() {

        setPanel((prev) => {
            let newOne = { ...prev };
            newOne.isActivated = false;
            return newOne;
        })
    }

    function handlePanelCancle() {
        if (isSameData()) {
            handleDeActivate();
        } else {
            setfilterData((prev) => {
                let newOne = { ...prev };
                newOne.curr = [...newOne.prev];
                return newOne;
            })
            handleDeActivate();
        }
    }


    function handlePanelApply() {
        setfilterData((prev) => {
            let newOne = { ...prev };
            newOne.app = [...newOne.curr];
            newOne.prev = [...newOne.curr];
            return newOne;
        })
        handleDeActivate();

    }

    function isSameData() {
        if (filterData.prev.length === filterData.curr.length) {
            let boolResult = true;

            filterData.prev.forEach((item, index) => {
                if (filterData.curr[index] !== item) {
                    boolResult = false;
                }
            })
            return boolResult;

        } else {
            return false;
        }
    }

    useEffect(() => {
        setPanel((prev) => {
            prev.activate = handleActivate;
            prev.deActivate = handleDeActivate;
            return prev;
        })
    }, [])

    return (
        <>
            <div className='flex flex-col items-center relative '>

                <div className='flex flex-row items-center p-1 pt-2 pb-2 
             w-full  overflow-x-auto bg-green-900 '>
                    <FilterButtons index={1} name={'Remote'} color={'bg-orange-700'}
                        fontColor={'text-red-100'} panelControl={panel}
                        setData={setfilterData} data={filterData} />
                    <FilterButtons index={2} name={'Part Time'} color="bg-red-800"
                        fontColor="text-slate-300" panelControl={panel}
                        setData={setfilterData} data={filterData} />
                    <FilterButtons index={3} name={'Full Time'} color="bg-teal-800"
                        fontColor="text-teal-200" panelControl={panel}
                        setData={setfilterData} data={filterData} />
                    <FilterButtons index={4} name={'Office'} color="bg-pink-800"
                        fontColor="text-pink-300" panelControl={panel}
                        setData={setfilterData} data={filterData} />



                </div>
                {panel.isActivated ?
                    <div className='s relative p-1 w-full'>
                        <FilterConfirmation cancel={handlePanelCancle} apply={handlePanelApply} />
                    </div>
                    : null}
            </div>

        </>
    );
}

function FilterConfirmation({ apply, cancel }) {
    return (<>

        <div className='absolute flex flex-row items-center
         bg-green-900 p-2 -bottom-16 right-0 '>
            <button onClick={() => {

                if (cancel) {
                    cancel();
                }
            }} className=" m-1 p-2
      pl-4 pr-4 flex flex-row items-center
      justify-center hover:bg-green-900 active:bg-green-800 active:text-teal-950
      bg-green-950 rounded-xl 
      text-teal-700 
      border border-green-800" >
                Cancel
            </button>
            <button onClick={() => {
                if (apply) {
                    apply();
                }
            }} className=" m-1 p-2
      pl-4 pr-4 flex flex-row items-center
      justify-center hover:bg-green-900 active:bg-green-800 active:text-teal-950
      bg-green-950 rounded-xl 
      text-teal-700 
      border border-green-800" >

                Apply
            </button>
        </div>

    </>)
}

function FilterButtons({ name, color, fontColor, index,
    panelControl = { isActivated: null, activate: null, deActivate: null }, setData, data }) {
    const checkbox = useRef(null);
    const toggle = useRef(false);



    useEffect(() => {
        if (!data.curr[index]) {
            checkbox.current.checked = false;
            toggle.current = false;
        } else {
            checkbox.current.checked = true;
            toggle.current = true;
        }
    }, [data])


    function handleChange() {
        if (!panelControl.isActivated) {
            panelControl.activate();
        }
        if (checkbox.current.checked) {
            setData((prev) => {
                let newOne = { ...prev }
                newOne.curr[index] = name;
                return newOne;
            })
        } else {
            setData((prev) => {
                let newOne = { ...prev }
                newOne.curr[index] = null;
                return newOne;
            })
        }
    }

    function handleButton() {
        if (toggle.current) {
            toggle.current = false;
            checkbox.current.checked = false;
            handleChange();

        } else {
            toggle.current = true;
            checkbox.current.checked = true;
            handleChange();
        }
    }

    return (
        <>
            <button onClick={() => {
                handleButton();
            }} className={`flex flex-row items-center p-1 mr-1 shrink-0
            border rounded-lg  ${color} `}>
                <input ref={checkbox} onChange={(e) => {
                    //handleChange();
                }}
                    type='checkBox' name={name} value={name}></input>
                <lable className={`ml-1 ${fontColor}`}>{name}</lable>
            </button>
        </>
    );
}


export { Container, ContainerNav, Card, Filter };