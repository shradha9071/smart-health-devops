import HomeHero from "../components/HomeHero"

export default function Home() {
  return (
     <div style={{ backgroundColor: "#ffcccc", minHeight: "100vh" }}>
      
      <h1
        style={{
          textAlign: "center",
          fontSize: "40px",
          color: "red",
          padding: "20px",
          fontWeight: "bold",
        }}
      >
        Jenkins Auto Deployment Successful 🚀
      </h1>
      <HomeHero />
    </div>
  )
}
