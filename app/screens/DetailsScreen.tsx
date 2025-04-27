import React, { useRef, useState } from 'react';
import { 
  Button, 
  DrawerLayoutAndroid, 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  PanResponder 
} from 'react-native';

const DetailsScreen = () => {
    const drawer = useRef<DrawerLayoutAndroid>(null);
    const [drawerAlignment, setDrawerAlignment] = useState<'left' | 'right'>('left');

    // 手势处理
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // 水平滑动超过阈值时触发
                return Math.abs(gestureState.dx) > 10;
            },
            onPanResponderRelease: (_, gestureState) => {
                const { dx } = gestureState;
                if (Math.abs(dx) > 20) { // 滑动距离阈值
                    const direction = dx > 0 ? 'left' : 'right';
                    setDrawerAlignment(direction);
                    drawer.current?.openDrawer();
                }
            },
        })
    ).current;

    const navigationView = () => (
        <View style={[styles.navigationContainer, { width: Dimensions.get('window').width }]}>
            <View style={[
                styles.drawerContent,
                { alignItems: drawerAlignment === 'right' ? 'flex-end' : 'flex-start' }
            ]}>
                <Text style={styles.paragraph}>I'm in the {drawerAlignment} Drawer!</Text>
                <Button
                    title="Close drawer"
                    onPress={() => drawer.current?.closeDrawer()}
                />
            </View>
        </View>
    );

    return (
        <DrawerLayoutAndroid
            ref={drawer}
            drawerWidth={Dimensions.get('window').width}
            drawerPosition={drawerAlignment}
            renderNavigationView={navigationView}
            drawerLockMode="unlocked"
            //edgeWidth={0} // 禁用默认边缘触发
        >
            <View style={styles.container} {...panResponder.panHandlers}>
                <Text style={styles.text}>This is the Details Screen!</Text>
                <Text style={styles.paragraph}>Drawer content appears on the {drawerAlignment}!</Text>
                <Button
                    title="Toggle Drawer Side"
                    onPress={() => setDrawerAlignment(prev => prev === 'left' ? 'right' : 'left')}
                />
                <Text style={styles.paragraph}>
                    Swipe anywhere left/right to open the drawer!
                </Text>
                <Button
                    title="Open drawer"
                    onPress={() => drawer.current?.openDrawer()}
                />
            </View>
        </DrawerLayoutAndroid>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    navigationContainer: {
        flex: 1,
        backgroundColor: '#ecf0f1',
    },
    drawerContent: {
        width: 300,
        padding: 16,
        flex: 1,
    },
    paragraph: {
        padding: 16,
        fontSize: 15,
        textAlign: 'center',
    },
    text: {
        fontSize: 20,
    },
});

export default DetailsScreen;