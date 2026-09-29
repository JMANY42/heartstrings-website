/* Opens a link whose URL is fetched at click time rather than written into the
   page, so it never shows up in the page source (see the GroupMe link).

   The tab is opened before the request, while the click still counts as a user
   gesture, so popup blockers let it through; it is pointed at the URL once it
   arrives. If the browser blocks the tab anyway, the current tab navigates. */
export async function openFetchedLink(getUrl: () => Promise<string>) {
  const tab = window.open('', '_blank')
  if (tab) tab.opener = null

  try {
    const url = await getUrl()
    if (tab) {
      tab.location.href = url
    } else {
      window.location.href = url
    }
  } catch (error) {
    tab?.close()
    throw error
  }
}
