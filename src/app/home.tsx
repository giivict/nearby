import { useEffect, useState } from "react"
import { View, Text, Alert } from "react-native"
import MapView, { Callout, Marker } from "react-native-maps"

import { api } from "@/services/api"
import { colors, fontFamily } from "@/styles/theme"

import { Places } from "@/components/places"
import { PlaceProps } from "@/components/place"
import { Categories, CategoriesProps } from "@/components/categories"

import * as Location from 'expo-location';
import { IconWorldLongitude } from "@tabler/icons-react-native"
import { router } from "expo-router"

type MartketProps = PlaceProps & {
    latitude: number
    longitude: number
}

const currentLocation = {
    latitude: -23.561187293883442,
    longitude: -46.656451388116494,
}

export default function Home() {
    const [categories, setCategories] = useState<CategoriesProps>([])
    const [category, setCategory] = useState("")
    const [markets, setMarkets] = useState<MartketProps[]>([])
    
    async function fetchCategories() {
        try {
            const { data } = await api.get("/categories")
            setCategories(data)
            setCategory(data[0].id)
        } catch (error) {
            console.log(error)
            Alert.alert("Categorias", "Não foi possível carregar as categorias")
        }
    }

    async function fetchMarkets() {
        try {
            if(!category){
                return
            }
            const { data } = await api.get("/markets/category/" + category)
            setMarkets(data)
        } catch (error) {
            console.log(error)
            Alert.alert("Locais", "Não foi possível carregar os locais")
        }
    }

    async function getCurrentLocation() {
        try {
            const {granted} = await Location.requestForegroundPermissionsAsync();            
            
            if(granted) {
                const location = await Location.getCurrentPositionAsync()
            }
            
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchCategories()  
    }, [])

    useEffect (() => {
        fetchMarkets()
    }, [category])

    return (
        <View style={{flex: 1}}>
            <Categories data={categories} onSelect={setCategory} selected={category} />
        
            <MapView
                style={{flex: 1}}
                initialRegion={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                }}
                >
                <Marker
                identifier="current"
                coordinate={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                }}
                image={require("@/assets/location.png")}
                />
                {
                    markets.map((item) => (
                        <Marker 
                        key={item.id}
                        identifier={item.id}
                        coordinate={{
                            latitude: item.latitude,
                            longitude: item.longitude
                        }}
                        image={require("@/assets/pin.png")}
                        >
                            <Callout onPress={() => router.navigate(`/market/${item.id}`)}>
                                <View>
                                    <Text style={{
                                        fontSize: 14,
                                        color: colors.gray[600],
                                        fontFamily: fontFamily.medium
                                    }}>{item.name}</Text>
                                    <Text style={{
                                        fontSize: 12,
                                        color: colors.gray[600],
                                        fontFamily: fontFamily.regular
                                    }}>{item.address}</Text>

                                </View>
                            </Callout>
                        </Marker>
                    ))
                }
                
            </MapView>

            <Places data={markets} />
        </View>
    )
}