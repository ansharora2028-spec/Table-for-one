import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile } from 'node:fs/promises'

async function navigation(page: Page, name: string) {
  const toggle = page.getByRole('button', { name: 'Open menu', exact: true })
  if (await toggle.isVisible()) await toggle.click()
  await page.locator('#sidebar').getByRole('button', { name, exact: true }).click()
}

async function onboarding(
  page: Page,
  interests = ['Books', 'Travel', 'Food & cooking'],
  woman = true,
) {
  await page.getByRole('button', { name: 'Let’s find your people', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByLabel('Your first name').fill('Ananya')
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click()
  for (const interest of interests)
    await dialog.getByRole('button', { name: interest, exact: true }).click()
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click()
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click()
  if (woman) await dialog.getByRole('radio', { name: 'Woman', exact: true }).check()
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click()
  await dialog.getByRole('checkbox').check()
  await dialog.getByRole('button', { name: 'That’s me', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Your evening. Your way.' })).toBeVisible()
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
}

async function accessible(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
    })),
  ).toEqual([])
}

test('a complete local journey: introduce, match, reserve, reflect, refresh and delete', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Good food. Better company.' })).toBeVisible()
  await noOverflow(page)
  await onboarding(page)
  await page.getByRole('button', { name: 'Save my preferences' }).click()
  await page.getByRole('button', { name: 'Explore a sample match' }).click()
  await expect(page.getByRole('heading', { name: 'The Olive Room', exact: true })).toBeVisible()
  await noOverflow(page)
  await accessible(page)
  await page.getByRole('button', { name: 'Save my sample seat' }).click()
  await expect(page.getByRole('dialog')).toContainText('No money is collected')
  await accessible(page)
  await page.getByRole('button', { name: 'Confirm sample seat' }).click()
  await page.reload()
  await expect(
    page.getByText('Saved on this device. No restaurant reservation has been made.'),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Try post-meal reflection' }).click()
  await page.getByRole('button', { name: 'Save reflection' }).click()
  await expect(page.getByRole('alert')).toContainText('Choose a rating')
  await page.getByRole('button', { name: '4 stars', exact: true }).click()
  await page
    .getByLabel('Anything you’d like to remember?')
    .fill('A new beginning, and a very good conversation.')
  await page.getByRole('dialog').getByRole('button', { name: 'Meera', exact: true }).click()
  await page.getByRole('button', { name: 'Save reflection' }).click()
  await expect(page.getByRole('heading', { name: 'A little collection of good.' })).toBeVisible()
  await page.reload()
  await expect(
    page.getByText('A new beginning, and a very good conversation.', { exact: false }),
  ).toBeVisible()
  await expect(page.getByText('Eat again with Meera')).toBeVisible()
  await accessible(page)
  await navigation(page, 'Your profile')
  await accessible(page)
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download my data' }).click()
  expect((await download).suggestedFilename()).toBe('table-for-one-my-data.json')
  await page.getByRole('button', { name: 'Delete all local data', exact: true }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete all local data', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'A table for one. A little more possibility.' }),
  ).toBeVisible()
  await page.reload()
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('table-for-one:v1')!))
  expect(stored.profile).toBeNull()
  expect(stored.reflections).toEqual([])
  expect(stored.invitation).toBeNull()
  expect(stored.reports).toEqual([])
  expect(errors).toEqual([])
})

test('city chapters keep neighbourhoods and sample matches local', async ({ page }) => {
  await page.goto('/')
  await onboarding(page)
  await page.getByRole('button', { name: 'Bengaluru', exact: true }).click()
  await expect(page.getByText('Neighbourhoods in Bengaluru')).toBeVisible()
  await page.getByRole('button', { name: 'Indiranagar', exact: true }).click()
  await page.getByRole('button', { name: 'Save my preferences' }).click()
  await expect(page.locator('#sidebar')).toContainText('BENGALURU CHAPTER')
  await page.getByRole('button', { name: 'Explore a sample match' }).click()
  await expect(page.getByText('Indiranagar, Bengaluru', { exact: true })).toBeVisible()
  await page.reload()
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('table-for-one:v1')!))
  expect(stored.version).toBe(2)
  expect(stored.preferences.city).toBe('Bengaluru')
  expect(stored.preferences.areas).toEqual(['Indiranagar'])
  await noOverflow(page)
  await accessible(page)
})

test('chapter switcher opens from the sidebar and changes cities', async ({ page }) => {
  await page.goto('/')
  const mobileMenu = page.getByRole('button', { name: 'Open menu', exact: true })
  if (await mobileMenu.isVisible()) await mobileMenu.click()
  await page
    .locator('#sidebar')
    .getByRole('button', { name: 'GURUGRAM CHAPTER', exact: true })
    .click()
  await expect(page.getByRole('menu', { name: 'Choose a city chapter' })).toBeVisible()
  await page.getByRole('menuitem', { name: 'Bengaluru', exact: true }).click()
  await expect(
    page.locator('#sidebar').getByRole('button', { name: 'BENGALURU CHAPTER', exact: true }),
  ).toBeVisible()
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('table-for-one:v1')!))
  expect(stored.preferences.city).toBe('Bengaluru')
  expect(stored.preferences.areas).toEqual(['Indiranagar'])
})

test('invalid preferences and poor-fit samples never create an invitation', async ({ page }) => {
  await page.goto('/')
  await onboarding(page, ['Outdoors', 'Tech & ideas'], false)
  await page.getByRole('button', { name: 'Women-only table', exact: true }).click()
  await page.getByRole('button', { name: 'Save my preferences' }).click()
  await expect(page.getByRole('alert')).toContainText('Women-only tables are for women')
  await page.getByRole('button', { name: 'Mixed table', exact: true }).click()
  await page.getByRole('button', { name: 'Cyber Hub', exact: true }).click()
  await page.getByRole('button', { name: 'Save my preferences' }).click()
  await expect(page.getByRole('alert')).toContainText('Choose at least one area')
  await page.getByRole('button', { name: 'Cyber Hub', exact: true }).click()
  await page.getByRole('button', { name: 'Save my preferences' }).click()
  await page.getByRole('button', { name: 'Explore a sample match' }).click()
  await expect(page.getByRole('heading', { name: 'We won’t force a fit.' })).toBeVisible()
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('table-for-one:v1')!))
  expect(stored.invitation).toBeNull()
  expect(stored.profile.interests).toEqual(['Outdoors', 'Tech & ideas'])
  await noOverflow(page)
})

test('safety notes are explicitly local and render user text safely', async ({ page }) => {
  await page.goto('/#safety')
  await page.getByRole('button', { name: 'Save a private safety note' }).click()
  await expect(page.getByRole('dialog')).toContainText('No one monitors this note')
  await page
    .getByLabel('What would you like to record?')
    .fill('<script>alert("not executed")</script>')
  await page.getByRole('button', { name: 'Save locally' }).click()
  await page.reload()
  await expect(
    page.getByText('<script>alert("not executed")</script>', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Local only · not submitted')).toBeVisible()
  await noOverflow(page)
  await accessible(page)
})

test('corrupted data is preserved until explicitly reset', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('initialized')) {
      localStorage.setItem('table-for-one:v1', '{not-json')
      sessionStorage.setItem('initialized', 'yes')
    }
  })
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('It has not been overwritten')
  expect(await page.evaluate(() => localStorage.getItem('table-for-one:v1'))).toBe('{not-json')
  await page.getByRole('button', { name: 'Reset local data' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Delete all local data' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Good food. Better company.' })).toBeVisible()
})

test('dialog is keyboard dismissible and all explanatory pages fit the viewport', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Let’s find your people', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Let’s find your people', exact: true }),
  ).toBeFocused()
  await navigation(page, 'How it works')
  await expect(
    page.getByRole('heading', { name: 'Strangers. Then, maybe, regulars.' }),
  ).toBeVisible()
  await noOverflow(page)
  await navigation(page, 'A safer table')
  await expect(page.getByRole('heading', { name: 'A safer seat at the table.' })).toBeVisible()
  await noOverflow(page)
})

test('home, onboarding and preferences have no automated WCAG AA violations', async ({ page }) => {
  await page.goto('/')
  await accessible(page)
  await page.getByRole('button', { name: 'Let’s find your people', exact: true }).click()
  await accessible(page)
  await page.keyboard.press('Escape')
  await onboarding(page)
  await accessible(page)
})

test('deleting data in one tab clears another tab and cannot be undone by its stale state', async ({
  page,
  context,
}) => {
  await page.goto('/')
  await onboarding(page)
  await page.getByRole('button', { name: 'Save my preferences' }).click()
  const other = await context.newPage()
  await other.goto('/#preferences')
  await expect(other.getByRole('heading', { name: 'Your evening. Your way.' })).toBeVisible()
  await navigation(page, 'Your profile')
  await page.getByRole('button', { name: 'Delete all local data', exact: true }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete all local data', exact: true })
    .click()
  await expect(other.getByRole('button', { name: 'Create my profile' })).toBeVisible()
  await other.reload()
  await expect(other.getByRole('button', { name: 'Create my profile' })).toBeVisible()
  expect(
    await other.evaluate(() => JSON.parse(localStorage.getItem('table-for-one:v1')!).profile),
  ).toBeNull()
})

test('storage failure lets users export current progress rather than a stale saved record', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'table-for-one:v1')
        throw new DOMException('Storage is full', 'QuotaExceededError')
      return original.call(this, key, value)
    }
  })
  await page.goto('/#safety')
  await page.getByRole('button', { name: 'Save a private safety note' }).click()
  await page.getByLabel('What would you like to record?').fill('A note that could not be saved.')
  await page.getByRole('button', { name: 'Save locally' }).click()
  await expect(page.getByRole('alert')).toContainText('couldn’t save')
  const downloadPromise = page.waitForEvent('download')
  await page
    .getByRole('alert')
    .getByRole('button', { name: /Download/ })
    .click()
  const downloaded = await downloadPromise
  const content = JSON.parse(await readFile((await downloaded.path())!, 'utf8'))
  expect(content.reports?.[0]?.note).toBe('A note that could not be saved.')
  await expect(page.getByRole('button', { name: 'Download current progress' })).toBeVisible()
})

test('profile and preference changes invalidate an existing sample reservation', async ({
  page,
}) => {
  await page.goto('/')
  await onboarding(page)
  await page.getByRole('button', { name: 'Women-only table', exact: true }).click()
  await page.getByRole('button', { name: 'Save my preferences' }).click()
  await page.getByRole('button', { name: 'Explore a sample match' }).click()
  await page.getByRole('button', { name: 'Save my sample seat' }).click()
  await page.getByRole('button', { name: 'Confirm sample seat' }).click()
  await navigation(page, 'Your profile')
  await page.getByRole('button', { name: 'Edit my profile' }).click()
  const dialog = page.getByRole('dialog')
  for (let step = 0; step < 3; step++)
    await dialog.getByRole('button', { name: 'Continue', exact: true }).click()
  await dialog.getByRole('radio', { name: 'Man', exact: true }).check()
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click()
  await dialog.getByRole('checkbox').check()
  await dialog.getByRole('button', { name: 'That’s me', exact: true }).click()
  await page.getByRole('button', { name: 'Save my preferences' }).click()
  await expect(page.getByRole('alert')).toContainText('Women-only tables are for women')
  await page.getByRole('button', { name: 'Mixed table', exact: true }).click()
  await page.getByRole('button', { name: 'Save my preferences' }).click()
  await page.reload()
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('table-for-one:v1')!).invitation),
  ).toBeNull()
  await page.getByRole('button', { name: 'Explore a sample match' }).click()
  await page.getByRole('button', { name: 'Save my sample seat' }).click()
  await page.getByRole('button', { name: 'Confirm sample seat' }).click()
  await navigation(page, 'Dining preferences')
  await page.getByRole('button', { name: 'Cyber Hub', exact: true }).click()
  await page.getByRole('button', { name: 'Golf Course Road', exact: true }).click()
  await page.getByRole('button', { name: 'Save my preferences' }).click()
  await page.reload()
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('table-for-one:v1')!).invitation),
  ).toBeNull()
  await expect(page.getByRole('button', { name: 'Explore a sample match' })).toBeVisible()
})
