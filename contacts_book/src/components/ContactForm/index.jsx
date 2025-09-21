import { useState ,useEffect}  from "react"

import LoadingView from "../Loader"
import FailureView from "../FailureView"

import "./index.css"

const apiStatusConstants={
     initial: 'INITIAL',
    success: 'SUCCESS',
    failure: 'FAILURE',
    inProgress: 'IN PROGRESS',
}

const ContactForm=()=>{
    const [name,setName]=useState("")
    const [email,setEmail]=useState("")
    const [phone,setPhone]=useState("")
    const [formDetails,updateFormDetails]=useState({})
    const [mailErrorMsg,setMailErrMsg]=useState("")
    const [phoneErrorMsg,setPhoneErrMsg]=useState("")
    const [contactsList,updateContactsList]=useState([])
    const [apiStatus,setApiStatus]=useState(apiStatusConstants.initial)
    
    const onChangeName=(event)=>setName(event.target.value)
    const onChangeEmail=(event)=>setEmail(event.target.value)
    const onChangePhoneNumber=(event)=>setPhone(event.target.value)
    
    const SubmitForm= async(event)=>{
        event.preventDefault()
        const emailregx = /^\S+@\S+\.\S+$/
        if (!emailregx.test(email)) {
            setMailErrMsg("Please enter a valid email address...")
            return
        } else {
            setMailErrMsg("")
        }

        const phoneRegex = /^\d{10}$/
        if (phone.length !== 10 || !phoneRegex.test(phone)) {
            setPhoneErrMsg("Please enter a valid 10-digit phone number...")
            return
        } else {
            setPhoneErrMsg("")
        }
        updateFormDetails({name,email,phone})
        postApiCall()
    }

    const postApiCall= async()=>{
        setApiStatus(apiStatusConstants.inProgress)
        const url="http://localhost:5000/contacts/"
        const contactDetails={name,email,phone}
        const options={
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(contactDetails)
        }
        try{
            const response= await fetch(url,options)
            if (response.ok===true){
                const data= await response.json()
                setApiStatus(apiStatusConstants.success)
                console.log(data)
                apiCall()
            }else{
                setApiStatus(apiStatusConstants.failure)

            }
        }catch(err){
            setApiStatus(apiStatusConstants.failure)
            console.log("Error fetching data:",err)
        }
    }

    const deleteApi=async(id)=>{
        setApiStatus(apiStatusConstants.inProgress)
        const url=`http://localhost:5000/contacts/${id}`
        const options={method:"DELETE"}
        try{
            const response= await fetch(url,options)
            if (response.ok===true){
                setApiStatus(apiStatusConstants.success)
                console.log("contact deleted successfully")
            }else{
                setApiStatus(apiStatusConstants.failure)

            }
        }catch(err){
            setApiStatus(apiStatusConstants.failure)
            console.log("Error fetching data:",err)
        }
    }

    const deleteContact=(id)=>{
        deleteApi(id)
        updateContactsList((prev)=>{
            return prev.filter(each=>(each.id!==id))
        })
    }

    useEffect(()=>{
            apiCall()
    },[])

    const apiCall=async()=>{
        setApiStatus(apiStatusConstants.inProgress)
        try {
            const responseData = await fetch("http://localhost:5000/contacts?page=1&limit=100") 
            if (responseData.ok === true) {
                const data = await responseData.json()
                updateContactsList(data)
                setApiStatus(apiStatusConstants.success)
            } else {
                setApiStatus(apiStatusConstants.failure)
    
            }
        } catch (e) {
            setApiStatus(apiStatusConstants.failure)
            console.error("Error fetching data:", e);
        }

    }

    const renderContactsList=()=>{
        switch(apiStatus){
            case apiStatusConstants.inProgress:
                return <LoadingView/>
            case apiStatusConstants.failure:
                return <FailureView/>
            case apiStatusConstants.success:
                return (<div className="contacts-list-container">
                {contactsList.map((each) => (
                    <div key={each.id} className="contact-item-container">
                        <p className="contact-name">{each.name}</p>
                        <div className="right-side">
                            <p className="contact-email">{each.email}</p>
                            <p className="contact-phone">{each.phone}</p>
                            <button type="button" onClick={()=>{deleteContact(each.id)}}>Delete Contact</button>
                        </div>
                    </div>
                ))}
            </div>)
            default:
                return null
        }
    }

    return(
        <div className="form-container">
            <h1 className="form-heading">Add Contacts by filling details below</h1>
            <form className="form-card"  onSubmit={SubmitForm}>
                <div className="input-container">
                    <label htmlFor="name" className="label-element">Name</label>
                    <input 
                        className="input-element"  
                        type="text" placeholder="Enter Name" 
                        onChange={onChangeName} 
                        id="name"
                        value={name}
                    />
                </div>
                 <div className="input-container">
                    <label htmlFor="email" className="label-element">Email</label>
                    <input 
                        className="input-element"  
                        type="text" placeholder="Enter Email" 
                        onChange={onChangeEmail} 
                        id="email"
                        value={email}
                    />
                    <p className="error-message">{mailErrorMsg}</p>
                </div>
                 <div className="input-container">
                    <label htmlFor="phone" className="label-element">Mobile Number</label>
                    <input 
                        className="input-element"  
                        type="text" placeholder="Enter Phone Number" 
                        onChange={onChangePhoneNumber} 
                        id="phone"
                        value={phone}
                    />
                    <p className="error-message">{phoneErrorMsg}</p>
                </div>
                <button className="add-button" type="submit">Add Contact</button>
            </form>
            {renderContactsList()}
            
        </div>
    )

}

export default ContactForm