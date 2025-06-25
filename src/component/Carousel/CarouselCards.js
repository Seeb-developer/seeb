import React from 'react'
import { View } from "react-native"
import CarouselCardItem, { SLIDER_WIDTH, ITEM_WIDTH } from './CarouselCardItem'
import { width } from '../../utils/constent'
import { Colors } from '../../utils/theme'
import Carousel, { Pagination } from'react-native-snap-carousel';
const CarouselCards = ({ press, size, radius, height, data, theme, pagination, autoplay, loop }) => {
  const [index, setIndex] = React.useState(0)
  const isCarousel = React.useRef(null)
  // const [data, setData] = React.useState([
  //   {
  //     title: "Aenean leo",
  //     body: "Ut tincidunt tincidunt erat. Sed cursus turpis vitae tortor. Quisque malesuada placerat nisl. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.",
  //     imgUrl: require("../../asset/Rectangle.png"),
  //   },
  //   {
  //     title: "In turpis",
  //     body: "Aenean ut eros et nisl sagittis vestibulum. Donec posuere vulputate arcu. Proin faucibus arcu quis ante. Curabitur at lacus ac velit ornare lobortis. ",
  //     imgUrl: require("../../asset/Rectangle15.png"),
  //   },
  //   {
  //     title: "Lorem Ipsum",
  //     body: "Phasellus ullamcorper ipsum rutrum nunc. Nullam quis ante. Etiam ultricies nisi vel augue. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc.",
  //     imgUrl: require("../../asset/Rectangle.png"),
  //   },
  // ])

  return (
    <View>
      {console.log("data of images", data)}
      <Carousel
        layout={'default'}
        // layoutCardOffset={9}
        ref={isCarousel}
        data={data}
        renderItem={(item, index) => <CarouselCardItem  key={index} item={item} index={index} size={size} radius={radius} height={height} press={press} />}
        sliderWidth={width}
        itemWidth={width}
        onSnapToItem={(index) => setIndex(index)}
        useScrollView={true}
        autoplay={autoplay}
        loop={loop}
        autoplayDelay={500}
      />
      {pagination &&
        <Pagination
          dotsLength={data.length}
          activeDotIndex={index}
          carouselRef={isCarousel}
          dotStyle={{
            width: 8,
            height: 8,
            borderRadius: 5,
            marginHorizontal: 0,
            backgroundColor: theme == "dark" ? 'rgba(0, 196, 255, 1)' : 'rgba(0, 196, 255, 1)',
            // marginBottom: -10
          }}
          inactiveDotOpacity={0.4}
          inactiveDotScale={0.6}
          tappableDots={true}
          containerStyle={{ paddingTop: 15, marginBottom: -25 }}
        />
      }
    </View>
  )
}

export default CarouselCards