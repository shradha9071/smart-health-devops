export default function SimpleApp() {
  return (
    <div style={{
      textAlign: "center",
      padding: "50px",
      fontFamily: "Arial"
    }}>
      
      <h1 style={{
        color: "blue",
        fontSize: "50px"
      }}>
        🚀 My Simple React App
      </h1>

      <p style={{
        fontSize: "22px",
        marginTop: "20px"
      }}>
        Welcome to my DevOps application deployed using
        GitHub, Jenkins, Docker, and AWS EC2.
      </p>

      <button style={{
        padding: "12px 25px",
        fontSize: "18px",
        marginTop: "30px",
        backgroundColor: "green",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
      }}>
        Click Me
      </button>

    </div>
  )
}