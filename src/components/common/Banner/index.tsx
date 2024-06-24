import { useEffect, useState, type ReactElement } from 'react'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 1,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 1,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
}

const BANNER_API = process.env.NEXT_PUBLIC_BANNER_API
const BANNER_BASE_PATH = BANNER_API + '/klaytnsafe/web'
export default function Banner(): ReactElement {
  const [banners, setBanners] = useState<any>([])
  useEffect(() => {
    if (BANNER_API) {
      const fetchData = async () => {
        const response = await fetch(BANNER_BASE_PATH + '/banners.json')
        const json = await response.json()
        setBanners(json.banners)
      }
      fetchData().catch(console.error)
    }
  }, [])

  return (
    <>
      {banners.length > 0 && (
        <Carousel responsive={responsive} autoPlay={true} autoPlaySpeed={4000} infinite={true}>
          {banners.map((_banner: any, index: any) => (
            <a key={index} href={_banner['url']} target="_blank">
              <img width="100%" alt="Banner" src={BANNER_BASE_PATH + _banner['path']} />
            </a>
          ))}
        </Carousel>
      )}
    </>
  )
}
