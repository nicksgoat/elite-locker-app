/**
 * Script to update marketplace screens with bleeding effect
 * This provides the template code to apply to each screen
 */

// Template for the main component structure
const componentTemplate = (imageName, title, subtitle) => `
  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Extended background image that bleeds down */}
        <View style={styles.extendedBackground}>
          <ImageBackground
            source={require('../../assets/images/marketplace/${imageName}')}
            style={styles.extendedBackgroundImage}
            imageStyle={{ resizeMode: 'cover' }}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
            locations={[0, 0.2, 0.4, 0.7, 1]}
            style={styles.extendedGradient}
          />
        </View>

        {/* Spotify-style Header with Background Image */}
        <View style={styles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/marketplace/${imageName}')}
            style={styles.headerBackground}
            imageStyle={styles.headerBackgroundImage}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']}
              style={styles.headerGradient}
            >
              <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBackPress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>${title}</Text>
                  <Text style={styles.headerSubtitle}>Loading ${subtitle}...</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Extended background image that bleeds down */}
      <View style={styles.extendedBackground}>
        <ImageBackground
          source={require('../../assets/images/marketplace/${imageName}')}
          style={styles.extendedBackgroundImage}
          imageStyle={{ resizeMode: 'cover' }}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
          locations={[0, 0.2, 0.4, 0.7, 1]}
          style={styles.extendedGradient}
        />
      </View>

      {/* Spotify-style Header with Background Image */}
      <View style={styles.headerContainer}>
        <ImageBackground
          source={require('../../assets/images/marketplace/${imageName}')}
          style={styles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']}
            style={styles.headerGradient}
          >
            <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
                activeOpacity={0.8}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>${title}</Text>
                <Text style={styles.headerSubtitle}>{filteredItems.length} ${subtitle} available</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
      >
`;

// Template for styles
const stylesTemplate = `
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  extendedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 800,
  },
  extendedBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7,
  },
  extendedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 2,
  },
  headerBackground: {
    height: 200,
    width: '100%',
  },
  headerBackgroundImage: {
    resizeMode: 'cover',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
`;

// Screens to update
const screens = [
  { file: 'profiles.tsx', image: 'profiles.jpg', title: 'Profiles', subtitle: 'profiles' },
  { file: 'elitefit.tsx', image: 'elitefit.jpg', title: 'EliteFit', subtitle: 'programs' },
  { file: 'sessions.tsx', image: 'in-person.jpg', title: 'Sessions', subtitle: 'sessions' }
];

console.log('Templates ready for manual application to remaining marketplace screens');
console.log('Screens to update:', screens.map(s => s.file).join(', '));
