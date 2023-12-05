import fermiHeroImage from './Fermi_Earth_GWs.jpg'
import Overview from './overview'

export default function () {
  return (
    <>
      <img
        alt="fermi satellite with a GRB in the background, both positioned over earth"
        src={fermiHeroImage}
      ></img>
      <Overview />
    </>
  )
}
