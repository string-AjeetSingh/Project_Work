import { useRef, useEffect, useState } from "react";
import { useContext } from 'react';
import { myContext } from "../HomeWithLogin/myContext";
import { Link } from "react-router-dom";
import { commonContext } from "../../MyLib/commonContext";
import { ButtonAnimation } from "../../MyLib/Animation/animation";
import { requestServer } from "../../MyLib/RequestServer/requestServer";
import { pleaseWait } from "../../MyLib/Animation/animation";
import { flushSync } from "react-dom";


function AboutJob({ children, isAuthenicated, useInJobDetailjsx, useInProviderJobDetailjsx,
    __note_this_component_use_context_and_i_am_a_message__ }) {
    const applyButton = useRef(null);
    const applyButton1 = useRef(null);
    const applyButton3 = useRef(null);
    const fileButton = useRef(null);
    const [boolC, setboolC] = useState(false);
    const { dataForAboutJob } =
        useContext(useInJobDetailjsx || useInProviderJobDetailjsx ? commonContext : myContext);
    const [applyPanel, setapplyPanel] = useState(null);

    function handleApply() {

        console.log('from handleApply');
        setapplyPanel(true);
    }

    function handleRemovePanle() {
        //alert('focus found ');
        setapplyPanel(null);
    }

    async function requestApply(e) {
        let toApply = new requestServer(process.env.REACT_APP_SERVER_URL
            + '/xtServer/api/apply', { method: 'POST' });
        toApply.setAuthorizedFlag(isAuthenicated);
        toApply.setFormData('thePdf', e.target.files[0]);
        toApply.setFormData('data', { job: dataForAboutJob.no }, true);
        let result = await toApply.fetchNoStringify();

        if (result) {
            console.log('the result from requestAppy : ', result);
            if (result.json.status === 1) {

                flushSync(() => {
                    setboolC(true);
                })
                await pleaseWait(1000);
                handleRemovePanle()
                alert('you are succesfully applied for job');
                setboolC(false);

            } else if (result.json.status === 0) {
                alert('Error from server uploading data');

            }
            else if (result.json.status === -1) {
                alert(result.json.message);
            }
            else if (result.json.status === -2) {
                alert('file too large, provide below 3 MB');
            }
        }
        else {
            alert('bad response from server')
        }

        toApply.resetFormData();
    }

    useEffect(() => {


    }, [applyButton1.current])

    if (dataForAboutJob) {
        return (<>
            <div className="p-2 text-green-200 w-full 
            overflow-y-auto h-full  min-w-[350px]">
                <div className="flex flex-row justify-center  
            items-center mb-2">
                    <div className="rounded-full size-10
                mr-2  bg-slate-500">

                    </div>
                    <div className="font-serif text-2xl text-green-700
                font-bold">
                        {dataForAboutJob ? dataForAboutJob.companyName : "DummyMirosoft"}
                    </div>
                </div>


                <div className="text-[1.2rem] font-serif underline
               w-[60%] min-w-[320px]">

                    {dataForAboutJob ? dataForAboutJob.jobData.title
                        :
                        "Dummy Software Designer"}

                </div>
                <div className="flex flex-row justify-end">

                    {!useInProviderJobDetailjsx ?
                        <button ref={applyButton1}
                            onClick={() => {
                                handleApply();
                            }}
                            className="rounded-full font-serif font-bold
                text-2xl p-2 pr-5 pl-5 m-1 border-2  text-green-800
                 border-green-700
                 bg-blue-400 hover:border-black 
                 active:bg-blue-600 active:text-blue-400">

                            Apply
                        </button>

                        : null}
                    {applyPanel ?
                        <div ref={applyButton3} onClick={() => {

                            handleRemovePanle();
                        }}
                            className="fixed top-0 left-0 w-screen h-screen   z-10
                    flex flex-col justify-center items-center ">

                            <div onClick={(e) => {
                                e.stopPropagation();
                            }}
                                className="flex flex-col justify-center items-center
                        bg-green-950 p-2 rounded-2xl size-96 max-sm:size-80">
                                <button onClick={async (e) => {
                                    e.stopPropagation();
                                    await ButtonAnimation(applyButton);
                                    fileButton.current.click();
                                }}
                                    ref={applyButton}
                                    className="flex flex-col justify-center items-center w-28 overflow-hidden
                        p-0 pb-3 rounded-xl border-2 border-slate-800 hover:bg-slate-600 
                        bg-slate-700
                       ">
                                    {boolC ?
                                        <div className="font-bold text-[1.0rem] mt-1 text-slate-300
                            ">
                                            Succesfully Applied

                                        </div>
                                        :
                                        <>
                                            <img className=" size-28 rounded-lg" src="/stock/upload.png"></img>
                                            <div className="font-bold text-[1.0rem] mt-1 text-slate-300
                         ">
                                                Upload Resume Pdf
                                                <input ref={fileButton} onClick={(e) => {
                                                    e.stopPropagation();
                                                }} onChange={(e) => {
                                                    e.stopPropagation();

                                                    requestApply(e);
                                                }} type="file" className="hidden"></input>
                                            </div>
                                        </>
                                    }

                                </button>
                            </div>


                        </div>
                        :
                        null
                    }

                </div>
                <hr className="w-full mt-1 mb-1 rounded-xl border-1 
                border-slate-500"></hr>

                <div className="font-serif text-2xl text-slate-500 font-bold">
                    About:
                </div>
                <div className="relative left-5 w-[96%]">
                    {dataForAboutJob.jobData.description ?
                        dataForAboutJob.jobData.description
                        :
                        "no discription"}
                </div><br></br>

                <div className="font-serif text-2xl text-slate-500 font-bold">
                    Qualification:
                </div>
                <div className="relative left-5 w-[96%]">

                    {dataForAboutJob.jobData.qualifications ?
                        dataForAboutJob.jobData.qualifications
                        :
                        "no qualification"}
                </div>
                <div className="font-serif text-2xl text-slate-500 font-bold">
                    Requirements:
                </div>
                <div className="relative left-5 w-[96%]">
                    {dataForAboutJob.jobData.requirements ?
                        dataForAboutJob.jobData.requirements
                        :
                        "no qualification"}
                </div>

                <div className="font-serif text-2xl text-slate-500 font-bold">
                    Responsibilities:
                </div>
                <div className="relative left-5 w-[96%]">
                    - Dummy row about some thing. <br></br>
                    - Dummy row about some thing <br></br>
                    - Dummy row about some thing <br></br>
                    - Dummy row about some thing <br></br>
                    - Dummy row about some thing <br></br>
                </div>

                <hr className="w-full mt-1 mb-1 rounded-xl border-1 
                border-slate-500"></hr>
                <div className="m-1 flex flex-row flex-wrap justify-between">

                    <div className="m-1">
                        <div className="font-serif font-bold  text-slate-500
                        text-[1.2rem]">Email : </div>
                        <span className="relative bottom-2">
                            Mirosoft@gmail.com
                            {dataForAboutJob.jobSocialData.email.length > 1 ?
                                dataForAboutJob.jobSocialData.email
                                :
                                "Dummy@gmail.coim"}
                        </span>

                    </div>
                    <div className="m-1">
                        <div className="font-serif font-bold  text-slate-500 
                        text-[1.2rem]">X : </div>
                        <span className="relative bottom-2">
                            {dataForAboutJob.jobSocialData.x.length > 1 ?
                                <Link to={dataForAboutJob.jobSocialData.x}>
                                    {<span className="text-blue-400">
                                        {dataForAboutJob.jobSocialData.x}</span>}</Link>
                                :
                                "Dummy@x"}

                        </span>
                    </div>

                    <div className="m-1">
                        <div className="font-serif font-bold  text-slate-500
                        text-[1.2rem]">GitHub : </div>
                        <span className="relative bottom-2">
                            {dataForAboutJob.jobSocialData.github.length > 1 ?
                                <Link to={dataForAboutJob.jobSocialData.github}>
                                    {<span className="text-blue-400">
                                        {dataForAboutJob.jobSocialData.github}</span>}</Link>
                                :
                                "Dummy@gihub"}
                        </span>
                    </div>

                </div>
            </div>
        </>);
    }
    else {

    }

}

export { AboutJob };